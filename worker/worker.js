/**
 * CareerAtlas AI — optional API (Cloudflare Worker, free tier).
 *
 *   POST /chat   AI career assistant (proxies to the Claude API; key stays secret here)
 *   POST /track  anonymous usage counters (no personal data)
 *   GET  /stats?key=STATS_KEY   read the counters (for your impact report)
 *
 * Bindings (see wrangler.toml / README):
 *   secret ANTHROPIC_API_KEY   – Claude API key
 *   secret STATS_KEY           – any password, used to read /stats
 *   var    ALLOWED_ORIGINS     – comma-separated site origins allowed to call this API
 *   var    MODEL               – Claude model id (a small, low-cost model is plenty)
 *   var    DAILY_CHAT_LIMIT    – max chat messages per visitor IP per day (cost guardrail)
 *   kv     CA_KV               – KV namespace for counters + rate limits
 */

const SYSTEM_PROMPT = `You are CareerAtlas AI, a career coach for IEEE members and young professionals, embedded in the IEEE Young Professionals Summit website.

You receive a JSON summary of the user's profile analysis (career score, sub-scores, detected skills, target role, skill gaps, GitHub stats, resume tips). Use it to give specific, practical advice.

Guidelines:
- Be concise: short paragraphs and bullet lists, under ~220 words unless asked for a plan.
- Ground advice in the user's actual gaps and strengths from the summary.
- Prefer IEEE resources where they fit: IEEE Learning Network (iln.ieee.org) courses, IEEE Xplore papers and standards, IEEE societies and technical communities, IEEE Collabratec for networking, IEEE Young Professionals and local section events (events.vtools.ieee.org), IEEE Job Site (jobs.ieee.org). Do not invent specific course titles, people, or URLs beyond these.
- Plans should have concrete weekly/monthly steps and a small portfolio project that proves the skill.
- Stay on career, learning, and professional development topics. Politely decline unrelated requests.
- Never claim to guarantee jobs, salaries, or immigration outcomes.`;

const json = (data, status, cors) =>
  new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json", ...cors } });

function corsHeaders(req, env) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.length === 0 || allowed.includes("*") || allowed.includes(origin);
  return {
    ok,
    headers: {
      "Access-Control-Allow-Origin": ok ? (origin || "*") : "null",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin"
    }
  };
}

const today = () => new Date().toISOString().slice(0, 10);

async function bump(env, key, by) {
  if (!env.CA_KV) return;
  const v = parseInt((await env.CA_KV.get(key)) || "0", 10);
  await env.CA_KV.put(key, String(v + (by || 1)));
}

const EVENTS = new Set(["visit", "analyze", "sample", "target", "simulate", "resource_click", "mentor_click", "search", "chat"]);

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const { ok, headers: cors } = corsHeaders(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!ok) return json({ error: "Origin not allowed" }, 403, cors);

    // ---------------------------------------------------------------- /track
    if (url.pathname === "/track" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const ev = String(body.event || "");
      if (EVENTS.has(ev)) {
        ctx.waitUntil(Promise.all([bump(env, "total:" + ev), bump(env, "day:" + today() + ":" + ev)]));
        if (ev === "analyze" && Array.isArray(body.sources)) {
          ctx.waitUntil(Promise.all(body.sources.slice(0, 4).map((s) => bump(env, "source:" + String(s).slice(0, 12)))));
        }
        if ((ev === "target" || ev === "mentor_click") && body.role) ctx.waitUntil(bump(env, ev + ":" + String(body.role).slice(0, 20)));
      }
      return json({ ok: true }, 200, cors);
    }

    // ---------------------------------------------------------------- /stats
    if (url.pathname === "/stats" && req.method === "GET") {
      if (!env.STATS_KEY || url.searchParams.get("key") !== env.STATS_KEY) return json({ error: "Unauthorized" }, 401, cors);
      if (!env.CA_KV) return json({ error: "KV not configured" }, 500, cors);
      const out = {};
      let cursor;
      do {
        const page = await env.CA_KV.list({ cursor });
        for (const k of page.keys) if (!k.name.startsWith("rl:")) out[k.name] = parseInt((await env.CA_KV.get(k.name)) || "0", 10);
        cursor = page.list_complete ? null : page.cursor;
      } while (cursor);
      return json(out, 200, cors);
    }

    // ---------------------------------------------------------------- /chat
    if (url.pathname === "/chat" && req.method === "POST") {
      if (!env.ANTHROPIC_API_KEY) return json({ error: "Assistant not configured." }, 500, cors);
      const body = await req.json().catch(() => null);
      if (!body || !Array.isArray(body.messages) || !body.messages.length) return json({ error: "Bad request" }, 400, cors);

      // Rate limit per IP per day (cost guardrail)
      const limit = parseInt(env.DAILY_CHAT_LIMIT || "25", 10);
      const ip = req.headers.get("CF-Connecting-IP") || "unknown";
      const rlKey = "rl:" + today() + ":" + ip;
      if (env.CA_KV) {
        const used = parseInt((await env.CA_KV.get(rlKey)) || "0", 10);
        if (used >= limit) return json({ error: "You've reached today's assistant limit. Please come back tomorrow!" }, 429, cors);
        ctx.waitUntil(env.CA_KV.put(rlKey, String(used + 1), { expirationTtl: 60 * 60 * 26 }));
      }

      // Sanitize conversation: last 10 turns, text only, length-capped
      const messages = body.messages.slice(-10)
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
      while (messages.length && messages[0].role !== "user") messages.shift();
      if (!messages.length) return json({ error: "Bad request" }, 400, cors);

      const profile = JSON.stringify(body.profile || {}).slice(0, 4000);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: env.MODEL || "claude-haiku-5-5",
          max_tokens: 800,
          system: SYSTEM_PROMPT + "\n\nUser profile analysis (JSON):\n" + profile,
          messages
        })
      });
      if (!res.ok) {
        const detail = await res.text();
        console.log("Claude API error", res.status, detail.slice(0, 500));
        return json({ error: "The assistant is busy right now. Please try again in a moment." }, 502, cors);
      }
      const data = await res.json();
      const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      ctx.waitUntil(Promise.all([bump(env, "total:chat"), bump(env, "day:" + today() + ":chat")]));
      return json({ reply: reply || "Sorry, I couldn't come up with an answer. Try rephrasing?" }, 200, cors);
    }

    if (url.pathname === "/" ) return json({ service: "CareerAtlas AI API", ok: true }, 200, cors);
    return json({ error: "Not found" }, 404, cors);
  }
};
