/*
 * CareerAtlas AI — analysis engine.
 * Pure client-side: no data leaves the browser except public GitHub API calls.
 */
(function () {
  "use strict";

  const SKILLS = window.CA_SKILLS;
  const ROLES = window.CA_ROLES;
  const IEEE = window.CA_IEEE;

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pre-compile one regex per skill. Boundaries treat + # . / as word chars so
  // "c++" doesn't match inside "c++17" weirdly and "java" doesn't match "javascript".
  const SKILL_RX = SKILLS.map((s) => {
    const aliases = s.aliases.slice();
    if (s.name === "C") aliases.push("c/c++");
    const body = aliases.map(esc).join("|");
    return { skill: s, rx: new RegExp("(?<![a-z0-9+#])(?:" + body + ")(?![a-z0-9+#]|\\.[a-z])", "gi") };
  });
  const SKILL_BY_NAME = Object.fromEntries(SKILLS.map((s) => [s.name, s]));
  const SOFT = new Set(["Leadership", "Communication", "Research", "Standards & Compliance"]);

  // GitHub primary-language → skills
  const GH_LANG = {
    "Python": ["Python"], "Jupyter Notebook": ["Python", "Data Analysis"], "Java": ["Java"], "C++": ["C++"], "C": ["C"],
    "C#": ["C#"], "Go": ["Go"], "Rust": ["Rust"], "JavaScript": ["JavaScript"], "TypeScript": ["TypeScript", "JavaScript"],
    "Kotlin": ["Kotlin", "Mobile Development"], "Swift": ["Swift", "Mobile Development"], "Dart": ["Mobile Development"],
    "Scala": ["Scala"], "R": ["R"], "MATLAB": ["MATLAB"], "Verilog": ["Verilog"], "SystemVerilog": ["Verilog"],
    "VHDL": ["VHDL"], "Dockerfile": ["Docker"], "HCL": ["Infrastructure as Code"], "Shell": ["Linux"],
    "HTML": ["Frontend (React)"], "CSS": ["Frontend (React)"], "Vue": ["Frontend (React)"], "Svelte": ["Frontend (React)"],
    "Cuda": ["CUDA / GPU"], "Solidity": [], "PLpgSQL": ["SQL"], "TSQL": ["SQL"]
  };

  // ------------------------------------------------------------------ Ingestion

  async function pdfToText(file) {
    if (!window.pdfjsLib) throw new Error("PDF reader failed to load. Check your connection and refresh.");
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 12); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Rebuild lines using y-positions so bullets stay on separate lines
      let lastY = null, line = [], lines = [];
      for (const item of content.items) {
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(line.join(" ")); line = []; }
        line.push(item.str);
        lastY = y;
      }
      if (line.length) lines.push(line.join(" "));
      pages.push(lines.join("\n"));
    }
    return pages.join("\n").replace(/[ \t]+/g, " ").replace(/ \n/g, "\n").trim();
  }

  async function fileToText(file) {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".pdf") || file.type === "application/pdf") return pdfToText(file);
    if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) return file.text();
    throw new Error("Please upload a PDF or text file.");
  }

  function cleanGitHubUser(input) {
    if (!input) return "";
    let u = input.trim();
    const m = u.match(/github\.com\/([A-Za-z0-9-]+)/i);
    if (m) u = m[1];
    u = u.replace(/^@/, "");
    return /^[A-Za-z0-9-]{1,39}$/.test(u) ? u : "";
  }

  async function fetchGitHub(input) {
    const user = cleanGitHubUser(input);
    if (!user) throw new Error("That doesn't look like a GitHub username.");
    const h = { Accept: "application/vnd.github+json" };
    const [uRes, rRes] = await Promise.all([
      fetch("https://api.github.com/users/" + user, { headers: h }),
      fetch("https://api.github.com/users/" + user + "/repos?per_page=100&sort=pushed", { headers: h })
    ]);
    if (uRes.status === 404) throw new Error("GitHub user \"" + user + "\" not found.");
    if (uRes.status === 403) throw new Error("GitHub's hourly limit for this network was reached. Try again later.");
    if (!uRes.ok || !rRes.ok) throw new Error("Couldn't reach GitHub right now.");
    const profile = await uRes.json();
    const repos = (await rRes.json()) || [];
    const own = repos.filter((r) => !r.fork && !r.archived);
    const yearAgo = Date.now() - 365 * 864e5;
    const langs = {};
    own.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
    const text = own.map((r) => [r.name.replace(/[-_]/g, " "), r.description || "", (r.topics || []).join(" ")].join(" ")).join("\n");
    return {
      user,
      name: profile.name || user,
      avatar: profile.avatar_url,
      url: profile.html_url,
      bio: profile.bio || "",
      followers: profile.followers || 0,
      publicRepos: profile.public_repos || 0,
      ownRepos: own.length,
      stars: own.reduce((a, r) => a + (r.stargazers_count || 0), 0),
      activeRepos: own.filter((r) => new Date(r.pushed_at).getTime() > yearAgo).length,
      languages: langs,
      topRepos: own.slice().sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
        .slice(0, 5).map((r) => ({ name: r.name, url: r.html_url, stars: r.stargazers_count, lang: r.language, desc: r.description || "" })),
      text: text + "\n" + (profile.bio || "")
    };
  }

  // ------------------------------------------------------------------ Skills

  function extractSkills(sources) {
    // sources: [{ label, text }]
    const found = {};
    for (const { label, text } of sources) {
      if (!text) continue;
      const t = " " + text.toLowerCase() + " ";
      for (const { skill, rx } of SKILL_RX) {
        rx.lastIndex = 0;
        const hits = t.match(rx);
        if (hits && hits.length) {
          const f = (found[skill.name] = found[skill.name] || { name: skill.name, cat: skill.cat, count: 0, sources: new Set() });
          f.count += hits.length;
          f.sources.add(label);
        }
      }
    }
    return found;
  }

  function addGitHubLanguages(found, gh) {
    if (!gh) return;
    for (const [lang, n] of Object.entries(gh.languages)) {
      for (const sk of GH_LANG[lang] || []) {
        const s = SKILL_BY_NAME[sk];
        if (!s) continue;
        const f = (found[sk] = found[sk] || { name: sk, cat: s.cat, count: 0, sources: new Set() });
        f.count += n;
        f.sources.add("GitHub");
      }
    }
    if (gh.ownRepos > 0) {
      const f = (found["Git"] = found["Git"] || { name: "Git", cat: "Software", count: 0, sources: new Set() });
      f.count += 1; f.sources.add("GitHub");
    }
  }

  // Strength 1–3 per skill from frequency and number of sources
  function skillStrength(f) {
    const n = f.count + (f.sources.size - 1) * 2;
    return n >= 5 ? 3 : n >= 2 ? 2 : 1;
  }

  // ------------------------------------------------------------------ Scoring

  const sat = (x, k) => 1 - Math.exp(-x / k); // smooth 0→1 saturation
  const clamp = (x) => Math.max(0, Math.min(100, Math.round(x)));

  const ACTION_VERBS = ["achieved", "architected", "automated", "built", "created", "debugged", "delivered", "deployed", "designed",
    "developed", "drove", "engineered", "established", "implemented", "improved", "increased", "launched", "led", "managed",
    "mentored", "migrated", "optimized", "organized", "owned", "published", "reduced", "refactored", "researched", "scaled",
    "shipped", "spearheaded", "streamlined", "taught", "tested", "trained", "analyzed", "coordinated", "authored", "presented"];

  function countRx(text, rx) { const m = text.match(rx); return m ? m.length : 0; }

  function scoreResume(text) {
    if (!text || text.length < 80) return null;
    const t = text.toLowerCase();
    const tips = [];
    const sections = {
      Experience: /\b(experience|work history|employment|internships?)\b/,
      Education: /\b(education|academic|university|college|b\.?tech|b\.?s\.?|m\.?s\.?|bachelor|master|ph\.?d)\b/,
      Skills: /\b(skills|technologies|tech stack|tools)\b/,
      Projects: /\bprojects?\b/,
      "Achievements / Activities": /\b(publications?|certifications?|awards?|honou?rs|activities|volunteer|leadership|achievements)\b/
    };
    const present = Object.entries(sections).filter(([, rx]) => rx.test(t)).map(([k]) => k);
    const missing = Object.keys(sections).filter((k) => !present.includes(k));
    if (missing.length) tips.push("Add a clear " + missing.join(" / ") + " section.");

    const quant = countRx(t, /(\d+(\.\d+)?\s?%|\$\s?\d|\b\d+(\.\d+)?\s?(x|k|m|ms|hrs?|hours|users|customers|requests|people|members|engineers)\b|\b\d{2,}\+?\b(?!\s*(?:19|20)\d{2}))/g);
    if (quant < 6) tips.push("Quantify impact — add numbers (%, users, latency, $ saved) to more bullets.");

    const verbs = new Set(ACTION_VERBS.filter((v) => new RegExp("\\b" + v + "\\b").test(t)));
    if (verbs.size < 8) tips.push("Start bullets with strong action verbs (built, led, optimized, shipped).");

    const words = countRx(t, /\b[a-z][a-z'+#.-]*\b/g);
    if (words < 300) tips.push("Your resume looks short — expand on project and role impact.");
    if (words > 1100) tips.push("Your resume is long — tighten to the most relevant 1–2 pages.");

    const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(t);
    const hasLinkedIn = /linkedin\.com\//.test(t);
    const hasGit = /github\.com\/|gitlab\.com\/|portfolio|\.dev\b|\.io\b/.test(t);
    if (!hasLinkedIn || !hasGit) tips.push("Include your LinkedIn and GitHub/portfolio links in the header.");

    const weak = countRx(t, /\b(responsible for|worked on|helped with|duties included|various)\b/g);
    if (weak > 2) tips.push("Replace passive phrases like “responsible for” / “worked on” with outcomes.");

    const lengthScore = words >= 350 && words <= 1000 ? 1 : words < 350 ? words / 350 : Math.max(0.5, 1 - (words - 1000) / 1200);
    const score =
      30 * (present.length / 5) +
      25 * sat(quant, 4) +
      20 * Math.min(1, verbs.size / 10) +
      15 * lengthScore +
      (hasEmail ? 4 : 0) + (hasLinkedIn ? 3 : 0) + (hasGit ? 3 : 0) -
      Math.min(8, weak * 2);
    return { score: clamp(score), tips, sections: present, quant, verbs: verbs.size, words };
  }

  function analyze(input) {
    // input: { resumeText, linkedinText, extraText, github, targetRoleId }
    const resumeText = input.resumeText || "";
    const linkedinText = input.linkedinText || "";
    const extraText = input.extraText || "";
    const gh = input.github || null;
    const allText = [resumeText, linkedinText, extraText, gh ? gh.text : ""].join("\n");
    const lower = allText.toLowerCase();

    const found = extractSkills([
      { label: "Resume", text: resumeText },
      { label: "LinkedIn", text: linkedinText },
      { label: "Profile notes", text: extraText },
      { label: "GitHub", text: gh ? gh.text : "" }
    ]);
    addGitHubLanguages(found, gh);
    const skills = Object.values(found).map((f) => ({ ...f, sources: [...f.sources], strength: skillStrength(f) }))
      .sort((a, b) => b.strength - a.strength || b.count - a.count);
    const skillSet = new Map(skills.map((s) => [s.name, s]));
    const tech = skills.filter((s) => !SOFT.has(s.name));

    // --- sub-scores
    const resume = scoreResume(resumeText || linkedinText);

    const techDepth = tech.reduce((a, s) => a + s.strength, 0);
    const cats = new Set(tech.map((s) => s.cat)).size;
    const technical = clamp(100 * (0.75 * sat(techDepth, 14) + 0.25 * Math.min(1, cats / 5)));

    let projects;
    const projMentions = countRx(lower, /\bprojects?\b/g) + countRx(lower, /\b(built|developed|designed|prototype|capstone|hackathon)\b/g);
    if (gh) {
      projects = clamp(30 * Math.min(1, gh.ownRepos / 12) + 20 * sat(gh.stars, 15) + 25 * Math.min(1, gh.activeRepos / 6) +
        15 * Math.min(1, Object.keys(gh.languages).length / 4) + 10 * sat(projMentions, 4));
    } else {
      projects = clamp(65 * sat(projMentions, 5));
    }

    const leadHits = countRx(lower, /\b(led|lead|leading|managed|mentored|mentoring|chair|chairperson|vice[- ]chair|president|founder|co-founder|organized|organizer|head of|captain|coordinator|officer|volunteer|treasurer|secretary|counselor|spearheaded)\b/g);
    const ieeeVol = countRx(lower, /\bieee\b[^\n]{0,60}\b(chair|volunteer|officer|member|section|branch|chapter|affinity|yp|young professionals|wie)\b/g);
    const leadership = clamp(100 * sat(leadHits + ieeeVol * 1.5, 5));

    const resHits = countRx(lower, /\b(publications?|published|journal|conference|proceedings|transactions|doi|arxiv|patent(ed|s)?|thesis|dissertation|peer[- ]review(ed|er)?|reviewer|orcid|google scholar|citations?)\b/g);
    const research = clamp(100 * sat(resHits, 5));

    const comHits = countRx(lower, /\b(presented|presentation|talk|speaker|keynote|panel(ist)?|workshop|webinar|taught|teaching|tutor|instructor|blog|wrote|authored|documentation|newsletter|podcast|mentored)\b/g);
    const communication = clamp(100 * (0.7 * sat(comHits, 5) + 0.3 * (resume ? resume.score / 100 : 0.4)));

    const parts = [
      { key: "resume", label: "Resume Quality", score: resume ? resume.score : null, w: 0.22 },
      { key: "technical", label: "Technical Skills", score: technical, w: 0.26 },
      { key: "projects", label: "Projects", score: projects, w: 0.17 },
      { key: "leadership", label: "Leadership", score: leadership, w: 0.12 },
      { key: "research", label: "Research Impact", score: research, w: 0.1 },
      { key: "communication", label: "Communication", score: communication, w: 0.13 }
    ];
    const active = parts.filter((p) => p.score !== null);
    const wsum = active.reduce((a, p) => a + p.w, 0);
    const overall = clamp(active.reduce((a, p) => a + p.score * p.w, 0) / wsum);

    // --- roles
    const roles = ROLES.map((r) => roleGap(r, skillSet)).sort((a, b) => b.pct - a.pct);
    const target = input.targetRoleId ? roles.find((r) => r.role.id === input.targetRoleId) : roles[0];

    return {
      overall, band: band(overall), parts, skills, tech, resume, github: gh,
      roles, target,
      nextSteps: nextSteps({ resume, gh, target, leadership, research, communication, skills }),
      textLength: allText.length
    };
  }

  function band(s) {
    if (s >= 80) return { label: "Standout", note: "You're interview-ready for most target roles." };
    if (s >= 65) return { label: "Strong", note: "A few focused improvements will make you stand out." };
    if (s >= 45) return { label: "Developing", note: "Good foundation — close the top gaps below." };
    return { label: "Emerging", note: "Start with the quick wins below; each one moves the score." };
  }

  function roleGap(role, skillSet) {
    let total = 0, got = 0;
    const have = [], missing = [];
    for (const [name, w] of Object.entries(role.skills)) {
      total += w;
      const s = skillSet.get(name);
      if (s) {
        // partial credit for a single weak mention
        const credit = s.strength >= 2 ? 1 : 0.75;
        got += w * credit;
        have.push({ name, weight: w, strength: s.strength });
      } else {
        missing.push({ name, weight: w, priority: w >= 3 ? "High" : w === 2 ? "Medium" : "Low" });
      }
    }
    missing.sort((a, b) => b.weight - a.weight);
    const pct = Math.round((100 * got) / total);
    // Career simulator: close the top 3 gaps
    const top3 = missing.slice(0, 3);
    const simPct = Math.min(100, Math.round((100 * (got + top3.reduce((a, m) => a + m.weight, 0))) / total));
    return { role, pct, have, missing, simPct, simSkills: top3.map((m) => m.name) };
  }

  function simulate(roleId, skills, addSkills) {
    const set = new Map(skills.map((s) => [s.name, s]));
    addSkills.forEach((n) => set.set(n, { name: n, strength: 2 }));
    return roleGap(ROLES.find((r) => r.id === roleId), set).pct;
  }

  function nextSteps({ resume, gh, target, leadership, research, communication }) {
    const out = [];
    if (target && target.missing.length) {
      out.push({ kind: "skills", title: "Close your top skill gaps",
        body: "Add " + target.simSkills.slice(0, 2).join(" and ") + " to move your " + target.role.title + " match from " + target.pct + "% to " + target.simPct + "%." });
    }
    out.push({ kind: "learn", title: "Take an IEEE course",
      body: "IEEE Learning Network has courses for " + (target && target.missing[0] ? target.missing[0].name : "your target area") + "." });
    out.push({ kind: "mentor", title: "Connect with a mentor",
      body: "Talk to IEEE members already working as " + (target ? target.role.title + "s" : "professionals in your field") + "." });
    if (!gh) out.push({ kind: "github", title: "Add your GitHub", body: "Public projects are the fastest way to prove skills. Link your GitHub to score them." });
    if (resume && resume.tips.length) out.push({ kind: "resume", title: "Strengthen your resume", body: resume.tips[0] });
    if (leadership < 50) out.push({ kind: "lead", title: "Build leadership", body: "Volunteer with your IEEE section or YP group — organize one event this quarter." });
    if (research < 40) out.push({ kind: "research", title: "Publish or present", body: "Write up a project as an IEEE conference paper or present it at a local chapter." });
    if (communication < 50) out.push({ kind: "comm", title: "Share your work", body: "Give a short talk or write a post about a recent project." });
    out.push({ kind: "event", title: "Attend an IEEE event", body: "Find chapter meetings and conferences in your area." });
    return out;
  }

  // ------------------------------------------------------------------ IEEE resources

  function resourcesFor(missing, limit) {
    const out = [];
    const seen = new Set();
    for (const m of missing.slice(0, limit || 4)) {
      const s = SKILL_BY_NAME[m.name];
      const items = [];
      items.push({ type: "Course", title: m.name + " courses", source: "IEEE Learning Network", url: IEEE.links.learning });
      items.push({ type: "Papers", title: "Recent research on " + m.name, source: "IEEE Xplore", url: IEEE.xplore(m.name) });
      (IEEE.standards[m.name] || []).slice(0, 1).forEach((std) =>
        items.push({ type: "Standard", title: std, source: "IEEE Standards", url: IEEE.xploreStandards(std) }));
      const soc = IEEE.skillSociety[m.name] || (s && IEEE.societies[s.cat]);
      if (soc && !seen.has(soc.name)) { seen.add(soc.name); items.push({ type: "Community", title: soc.name, source: "Join / events", url: soc.url }); }
      items.push({ type: "Video", title: m.name + " talks & webinars", source: "IEEE.tv", url: IEEE.googleSite("ieeetv.ieee.org", m.name) });
      out.push({ skill: m.name, priority: m.priority, items });
    }
    return out;
  }

  // ------------------------------------------------------------------ Mentors

  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const col = (names) => head.findIndex((h) => names.some((n) => h === n || h.includes(n)));
    const idx = {
      name: col(["name"]), title: col(["title", "job"]), organization: col(["organization", "company", "employer"]),
      grade: col(["grade", "membership"]), location: col(["location", "city"]), skills: col(["skills", "expertise"]),
      roles: col(["roles"]), contact: col(["contact", "link", "url", "email"])
    };
    const split = (v) => (v || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    return rows.slice(1).filter((r) => r.some((c) => c.trim())).map((r) => ({
      name: (r[idx.name] || "").trim(), title: (r[idx.title] || "").trim(), organization: (r[idx.organization] || "").trim(),
      grade: (r[idx.grade] || "IEEE Member").trim(), location: (r[idx.location] || "").trim(),
      skills: split(r[idx.skills]), roles: split(r[idx.roles]).map((x) => x.toLowerCase()), contact: (r[idx.contact] || "").trim()
    })).filter((m) => m.name);
  }

  function matchMentors(mentors, result, n) {
    const target = result.target;
    const missing = new Set(target ? target.missing.map((m) => m.name) : []);
    const have = new Set(result.skills.map((s) => s.name));
    return mentors.map((m) => {
      const ms = m.skills.map((s) => s.toLowerCase());
      const canTeach = m.skills.filter((s) => missing.has(s));
      const shared = m.skills.filter((s) => have.has(s));
      let score = canTeach.length * 3 + shared.length * 0.5;
      if (target && (m.roles || []).includes(target.role.id)) score += 4;
      if (target && ms.some((s) => target.role.title.toLowerCase().includes(s))) score += 1;
      return { ...m, score, canTeach, shared };
    }).filter((m) => m.score > 0).sort((a, b) => b.score - a.score).slice(0, n || 4);
  }

  window.CA_ENGINE = { fileToText, fetchGitHub, cleanGitHubUser, analyze, simulate, resourcesFor, parseCSV, matchMentors, ROLES, SKILLS };
})();
