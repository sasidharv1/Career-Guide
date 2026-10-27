/*
 * CareerAtlas AI — UI controller.
 */
(function () {
  "use strict";

  const C = window.CA_CONFIG || {};
  const E = window.CA_ENGINE;
  const IEEE = window.CA_IEEE;
  const $ = (id) => document.getElementById(id);
  const h = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const CIRC = 2 * Math.PI * 52;

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  const state = { resumeFile: null, linkedinFile: null, input: null, result: null, mentors: null, mentorsAreSample: true, plan: new Set(), chat: [] };

  // ------------------------------------------------------------------ setup
  $("appName").textContent = C.appName || "CareerAtlas AI";
  $("eventName").textContent = C.eventName || "";
  if (C.privacyNote) $("privacyNote").textContent = C.privacyNote;

  const roleOptions = E.ROLES.map((r) => `<option value="${r.id}">${h(r.title)}</option>`).join("");
  $("targetRole").insertAdjacentHTML("beforeend", roleOptions);
  $("targetRole2").innerHTML = roleOptions;

  function track(event, data) {
    if (!C.apiBase) return;
    try {
      fetch(C.apiBase.replace(/\/$/, "") + "/track", {
        method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ event, ...(data || {}) })
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  }
  track("visit");

  function show(view) {
    ["intake", "loading", "dashboard"].forEach((v) => ($(v).hidden = v !== view));
    $("nav").hidden = view !== "dashboard";
    $("btnRestart").hidden = view !== "dashboard";
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  // ------------------------------------------------------------------ file drops
  function wireDrop(labelId, inputId, key) {
    const label = $(labelId), input = $(inputId);
    const msg = label.querySelector(".drop-text .muted");
    const set = (file) => {
      if (!file) return;
      state[key] = file;
      label.classList.add("done");
      msg.textContent = file.name;
      label.querySelector(".drop-state").textContent = "✓";
      hideError();
    };
    input.addEventListener("change", () => set(input.files[0]));
    label.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    ["dragenter", "dragover"].forEach((ev) => label.addEventListener(ev, (e) => { e.preventDefault(); label.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => label.addEventListener(ev, (e) => { e.preventDefault(); label.classList.remove("over"); }));
    label.addEventListener("drop", (e) => set(e.dataTransfer.files[0]));
  }
  wireDrop("dropResume", "fileResume", "resumeFile");
  wireDrop("dropLinkedIn", "fileLinkedIn", "linkedinFile");

  function showError(msg) { const el = $("formError"); el.textContent = msg; el.hidden = false; }
  function hideError() { $("formError").hidden = true; }

  // ------------------------------------------------------------------ analyze
  $("intakeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const gh = $("ghUser").value.trim();
    const extra = $("extraText").value.trim();
    if (!state.resumeFile && !state.linkedinFile && !gh && extra.length < 40) {
      showError("Add a resume, LinkedIn PDF, GitHub username, or paste some profile details to get started.");
      return;
    }
    if (gh && !E.cleanGitHubUser(gh)) { showError("That doesn't look like a GitHub username."); return; }
    show("loading");
    const warnings = [];
    try {
      const input = { extraText: extra, targetRoleId: $("targetRole").value || "" };
      if (state.resumeFile) {
        $("loadingText").textContent = "Reading your resume…";
        try { input.resumeText = await E.fileToText(state.resumeFile); }
        catch (err) { warnings.push("Resume: " + err.message); }
        if (input.resumeText !== undefined && input.resumeText.length < 80) warnings.push("We couldn't read much text from your resume — if it's a scanned image, try a text-based PDF.");
      }
      if (state.linkedinFile) {
        $("loadingText").textContent = "Reading your LinkedIn profile…";
        try { input.linkedinText = await E.fileToText(state.linkedinFile); }
        catch (err) { warnings.push("LinkedIn: " + err.message); }
      }
      if (gh) {
        $("loadingText").textContent = "Looking at your GitHub projects…";
        try { input.github = await E.fetchGitHub(gh); }
        catch (err) { warnings.push("GitHub: " + err.message); }
      }
      $("loadingText").textContent = "Scoring your profile…";
      run(input, warnings);
      track("analyze", { sources: [input.resumeText && "resume", input.linkedinText && "linkedin", input.github && "github", extra && "notes"].filter(Boolean) });
    } catch (err) {
      show("intake");
      showError(err.message || "Something went wrong. Please try again.");
    }
  });

  $("btnSample").addEventListener("click", () => {
    const s = window.CA_SAMPLE;
    show("loading");
    $("loadingText").textContent = "Loading the sample profile…";
    setTimeout(() => run({ resumeText: s.resumeText, github: s.github, targetRoleId: $("targetRole").value || s.targetRoleId, name: s.name, sample: true }, []), 350);
    track("sample");
  });

  $("btnRestart").addEventListener("click", () => { show("intake"); });
  document.querySelector(".brand").addEventListener("click", (e) => { e.preventDefault(); if (state.result) show("intake"); });

  function run(input, warnings) {
    const result = E.analyze(input);
    if (!result.textLength || (result.skills.length === 0 && !input.github)) {
      show("intake");
      showError((warnings[0] ? warnings.join(" ") + " " : "") + "We couldn't find enough profile information. Try a text-based PDF resume or paste your skills under “Paste extra details”.");
      return;
    }
    state.input = input; state.result = result; state.plan = new Set(); state.chat = [];
    render(warnings);
    show("dashboard");
    loadMentors();
  }

  // ------------------------------------------------------------------ render
  function guessName(input, result) {
    if (input.name) return input.name;
    if (result.github && result.github.name && result.github.name !== result.github.user) return result.github.name;
    const first = (input.resumeText || input.linkedinText || "").split("\n").map((l) => l.trim()).find((l) => l.length > 2);
    if (first && /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(first) && first.split(" ").length <= 4) return first;
    return "";
  }

  function setRing(el, val, color) {
    const fg = el.querySelector(".ring-fg");
    requestAnimationFrame(() => { fg.style.strokeDashoffset = String(CIRC * (1 - val / 100)); });
    if (color) fg.style.stroke = color;
  }
  function scoreColor(v) { return v >= 75 ? "var(--good)" : v >= 50 ? "var(--accent)" : v >= 35 ? "var(--warn)" : "var(--bad)"; }
  function countUp(el, to) {
    const t0 = performance.now(), d = 900;
    const step = (t) => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function render(warnings) {
    const r = state.result, input = state.input;
    const name = guessName(input, r);
    $("greet").textContent = name ? "Welcome, " + name.split(" ")[0] + "!" : "Your career overview";
    $("greetSub").textContent = input.sample
      ? "You're viewing a fictional sample profile. Upload your own to see your results."
      : (warnings.length ? "Note: " + warnings.join(" ") : "Here's your career overview and suggested actions.");

    // overall
    $("scoreRing").querySelector(".ring-fg").style.strokeDashoffset = CIRC;
    setRing($("scoreRing"), r.overall, scoreColor(r.overall));
    countUp($("scoreVal"), r.overall);
    $("bandLabel").textContent = r.band.label;
    $("bandNote").textContent = r.band.note;
    $("subScores").innerHTML = r.parts.map((p) => `
      <li><span>${h(p.label)}</span>${p.score === null ? '<span class="na">add resume</span>' : `<b>${p.score}<span class="muted">/100</span></b>`}
        <div class="meter"><i style="width:0" data-w="${p.score || 0}"></i></div></li>`).join("");
    animateBars($("subScores"));

    // sources
    const srcs = [
      ["Resume", !!input.resumeText], ["LinkedIn", !!input.linkedinText], ["GitHub", !!input.github],
      ["Extra details (Scholar, ORCID, certifications)", !!input.extraText]
    ];
    const pct = Math.round((100 * (srcs.filter((s) => s[1]).length * 0.7 + (r.skills.length >= 8 ? 1.2 : 0.4))) / (srcs.length * 0.7 + 1.2));
    $("completePct").textContent = Math.min(100, pct) + "%";
    $("sourceList").innerHTML = srcs.map(([n, ok]) => `<li class="${ok ? "" : "off"}"><span class="${ok ? "ok" : "no"}">${ok ? "✓" : "○"}</span>${h(n)}</li>`).join("");
    $("skillCount").textContent = r.skills.length;
    $("skillChips").innerHTML = r.skills.slice(0, 22).map((s) => `<span class="chip s${s.strength}" title="Found in: ${h(s.sources.join(", "))}">${h(s.name)}</span>`).join("") +
      (r.skills.length > 22 ? `<span class="chip">+${r.skills.length - 22} more</span>` : "");

    renderRoles();
    renderTarget();
    renderResume();
    renderGitHub();
    renderSearchScopes();
    setupChat();
  }

  function animateBars(root) {
    requestAnimationFrame(() => root.querySelectorAll(".meter i[data-w]").forEach((i) => (i.style.width = i.dataset.w + "%")));
  }

  function matchClass(p) { return p >= 70 ? "hi" : p >= 45 ? "mid" : "lo"; }

  function renderRoles() {
    const r = state.result;
    $("roleList").innerHTML = r.roles.slice(0, 5).map((g) => `
      <li><button type="button" data-role="${g.role.id}" class="${g.role.id === r.target.role.id ? "active" : ""}">
        <span class="r-title">${h(g.role.title)}</span><span class="match ${matchClass(g.pct)}">${g.pct}%</span>
        <span class="r-sub">${g.missing.length ? "Missing: " + h(g.missing.slice(0, 2).map((m) => m.name).join(", ")) : "All core skills covered"}</span>
      </button></li>`).join("");
    $("roleList").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => setTarget(b.dataset.role)));
    $("jobsLink").href = IEEE.links.jobs;
  }

  function setTarget(id) {
    const r = state.result;
    r.target = r.roles.find((g) => g.role.id === id) || r.target;
    state.plan = new Set();
    r.nextSteps = E.analyze(Object.assign({}, state.input, { targetRoleId: id })).nextSteps;
    renderRoles();
    renderTarget();
    renderMentors();
    track("target", { role: id });
  }
  $("targetRole2").addEventListener("change", (e) => setTarget(e.target.value));

  const ICONS = {
    skills: '<path d="M4 19l5-5 4 4 7-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    learn: '<path d="M3 7l9-4 9 4-9 4zM7 9v5c0 1.5 2.2 3 5 3s5-1.5 5-3V9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    mentor: '<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.2 3.2 0 010 6.4M18 14c2 .6 3 2.8 3 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    github: '<path d="M8 17l-5-5 5-5M16 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    resume: '<path d="M14 3H6v18h12V7zM9 12h6M9 16h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    lead: '<path d="M4 21V4l8 3 8-3v11l-8 3-8-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    research: '<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    comm: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    event: '<rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  const STEP_LINK = { skills: ["#gaps", "View gaps"], learn: ["#learn", "Explore courses"], mentor: ["#mentors", "Find mentors"],
    github: ["#", "Add GitHub", "restart"], resume: ["#resumeCard", "See resume tips"], lead: [IEEE.links.yp, "IEEE YP", "ext"],
    research: [IEEE.links.xplore, "IEEE Xplore", "ext"], comm: [IEEE.links.collabratec, "IEEE Collabratec", "ext"], event: [IEEE.links.events, "Find events", "ext"] };

  function renderTarget() {
    const r = state.result, g = r.target;
    $("targetRole2").value = g.role.id;
    document.querySelectorAll(".roleName").forEach((el) => (el.textContent = g.role.title));
    $("gapRole").textContent = g.role.title;
    $("gapRing").querySelector(".ring-fg").style.strokeDashoffset = CIRC;
    setRing($("gapRing"), g.pct);
    countUp($("gapVal"), g.pct);
    $("gapList").innerHTML = g.missing.length
      ? g.missing.slice(0, 6).map((m) => `<li class="p-${m.priority}"><span>${h(m.name)}</span><div class="meter"><i data-w="${m.weight * 33}"></i></div><span class="prio">${m.priority}</span></li>`).join("")
      : '<li class="empty">No gaps — you cover every skill we track for this role.</li>';
    animateBars($("gapList"));
    $("haveChips").innerHTML = g.have.length ? g.have.map((s) => `<span class="chip s${s.strength}">${h(s.name)}</span>`).join("") : '<p class="empty">None yet for this role.</p>';

    // next steps
    $("nextSteps").innerHTML = r.nextSteps.slice(0, 4).map((s) => {
      const [href, label, kind] = STEP_LINK[s.kind] || ["#", "Open"];
      return `<div class="step"><span class="ic"><svg viewBox="0 0 24 24">${ICONS[s.kind] || ICONS.skills}</svg></span>
        <strong>${h(s.title)}</strong><p>${h(s.body)}</p>
        <a class="link" style="margin-top:auto" href="${h(href)}" ${kind === "ext" ? 'target="_blank" rel="noopener"' : ""} ${kind === "restart" ? 'data-restart="1"' : ""}>${h(label)} →</a></div>`;
    }).join("");
    $("nextSteps").querySelectorAll("[data-restart]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); show("intake"); $("ghUser").focus(); }));

    renderSim();
    renderLearning();
  }

  function renderSim() {
    const r = state.result, g = r.target;
    const base = g.pct;
    $("simList").innerHTML = g.missing.length ? g.missing.map((m) => {
      const gain = E.simulate(g.role.id, r.skills, [m.name]) - base;
      return `<li><label><input type="checkbox" value="${h(m.name)}" ${state.plan.has(m.name) ? "checked" : ""}> ${h(m.name)} <span class="gain">+${gain}%</span></label></li>`;
    }).join("") : '<li class="empty">Nothing to add — try a more senior or adjacent role.</li>';
    $("simList").querySelectorAll("input").forEach((cb) => cb.addEventListener("change", () => {
      cb.checked ? state.plan.add(cb.value) : state.plan.delete(cb.value);
      updateSim();
      track("simulate");
    }));
    updateSim();
  }
  function updateSim() {
    const r = state.result, g = r.target;
    const now = g.pct, plan = E.simulate(g.role.id, r.skills, [...state.plan]);
    $("simNow").style.width = now + "%"; $("simNowV").textContent = now + "%";
    $("simPlan").style.width = plan + "%"; $("simPlanV").textContent = plan + "%";
  }

  function renderLearning() {
    const g = state.result.target;
    const groups = E.resourcesFor(g.missing.length ? g.missing : g.have.map((s) => ({ name: s.name, priority: "Low" })), 6);
    $("learnGrid").innerHTML = groups.map((grp) => `
      <div class="learn-col"><h4>${h(grp.skill)} <span class="prio-tag ${grp.priority}">${grp.priority}</span></h4>
        ${grp.items.map((it) => `<a class="res" href="${h(it.url)}" target="_blank" rel="noopener" data-res="${h(grp.skill)}">
          <span class="t t-${it.type}">${h(it.type)}</span><span><span class="rt">${h(it.title)}</span><br><span class="rs">${h(it.source)}</span></span></a>`).join("")}
      </div>`).join("");
    $("learnGrid").querySelectorAll("a.res").forEach((a) => a.addEventListener("click", () => track("resource_click", { skill: a.dataset.res })));
  }

  function renderResume() {
    const res = state.result.resume;
    if (!res) {
      $("resumeBody").innerHTML = '<p class="empty">Upload a resume or LinkedIn PDF to get formatting and impact feedback.</p>';
      return;
    }
    $("resumeBody").innerHTML = `
      <div class="kv"><div><b>${res.score}</b><span>Resume score</span></div><div><b>${res.quant}</b><span>Quantified results</span></div><div><b>${res.verbs}</b><span>Action verbs</span></div></div>
      <p class="muted small">Sections found: ${h(res.sections.join(", ") || "none")} · ~${res.words} words</p>
      ${res.tips.length ? '<ul class="tips">' + res.tips.map((t) => `<li>${h(t)}</li>`).join("") + "</ul>" : '<p class="empty">Looks solid — structure, impact and links all check out.</p>'}`;
  }

  function renderGitHub() {
    const gh = state.result.github;
    if (!gh) {
      $("ghBody").innerHTML = '<p class="empty">Add your GitHub username to score your projects and languages.</p>';
      return;
    }
    const langs = Object.entries(gh.languages).sort((a, b) => b[1] - a[1]).slice(0, 6);
    $("ghBody").innerHTML = `
      <div class="kv"><div><b>${gh.ownRepos}</b><span>Original repos</span></div><div><b>${gh.stars}</b><span>Stars</span></div><div><b>${gh.activeRepos}</b><span>Active (12 mo)</span></div></div>
      <div class="chips" style="margin:6px 0 10px">${langs.map(([l, n]) => `<span class="chip">${h(l)} · ${n}</span>`).join("")}</div>
      ${gh.topRepos.map((rp) => `<div class="repo"><div>${rp.url ? `<a href="${h(rp.url)}" target="_blank" rel="noopener">${h(rp.name)}</a>` : `<strong>${h(rp.name)}</strong>`}<small>${h(rp.desc || rp.lang || "")}</small></div><span class="stars">★ ${rp.stars}</span></div>`).join("")}`;
  }

  // ------------------------------------------------------------------ mentors
  async function loadMentors() {
    if (state.mentors) { renderMentors(); return; }
    state.mentors = window.CA_SAMPLE_MENTORS;
    state.mentorsAreSample = true;
    if (C.mentorSheetCsv) {
      try {
        const res = await fetch(C.mentorSheetCsv);
        if (res.ok) {
          const list = E.parseCSV(await res.text());
          if (list.length) { state.mentors = list; state.mentorsAreSample = false; }
        }
      } catch (e) { /* fall back to samples */ }
    }
    renderMentors();
  }

  const AV = ["#00629b", "#6d5bd0", "#1e9e5a", "#c2410c", "#0e7490", "#b73048", "#4d7c0f"];
  function renderMentors() {
    if (!state.mentors || !state.result) return;
    const list = E.matchMentors(state.mentors, state.result, 6);
    $("mentorGrid").innerHTML = list.length ? list.map((m, i) => {
      const initials = m.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
      const why = m.canTeach.length ? `Can help with <b>${h(m.canTeach.slice(0, 3).join(", "))}</b>` : m.shared.length ? `Shares your skills in <b>${h(m.shared.slice(0, 3).join(", "))}</b>` : "Works in your target role";
      const contact = m.contact ? (/^https?:|^mailto:/i.test(m.contact) ? m.contact : /@/.test(m.contact) ? "mailto:" + m.contact : "") : "";
      return `<div class="mentor">
        <div class="m-top"><span class="avatar" style="background:${AV[i % AV.length]}">${h(initials)}</span>
          <div><div class="m-name">${h(m.name)} ${state.mentorsAreSample ? '<span class="sample">Sample</span>' : ""}</div>
          <div class="m-sub">${h(m.title)}${m.organization ? " · " + h(m.organization) : ""}<br>${h(m.grade || "")}${m.location ? " · " + h(m.location) : ""}</div></div></div>
        <p class="m-why">${why}</p>
        ${contact ? `<a class="btn ghost sm" href="${h(contact)}" target="_blank" rel="noopener" data-mentor="1">Connect</a>`
                  : `<a class="btn ghost sm" href="${IEEE.links.collabratec}" target="_blank" rel="noopener" data-mentor="1">Find on IEEE Collabratec</a>`}
      </div>`;
    }).join("") : '<p class="empty">No mentor matches yet for this role.</p>';
    $("mentorGrid").querySelectorAll("[data-mentor]").forEach((a) => a.addEventListener("click", () => track("mentor_click", { role: state.result.target.role.id })));
    $("mentorNote").textContent = state.mentorsAreSample
      ? "These are sample mentors to show how matching works. Summit mentors who opt in will appear here."
      : "Mentors volunteered through the IEEE YP mentor sign-up.";
    if (C.mentorSignupUrl) { $("mentorSignup").href = C.mentorSignupUrl; $("mentorSignup").hidden = false; }
  }

  // ------------------------------------------------------------------ search
  const SCOPES = [
    ["Papers", (q) => IEEE.xplore(q)],
    ["Standards", (q) => IEEE.xploreStandards(q)],
    ["Courses", (q) => IEEE.googleSite("iln.ieee.org", q)],
    ["Webinars & talks", (q) => IEEE.googleSite("ieeetv.ieee.org", q)],
    ["Events", (q) => IEEE.googleSite("events.vtools.ieee.org", q)],
    ["Societies", (q) => IEEE.googleSite("ieee.org", q + " society")],
    ["Spectrum articles", (q) => IEEE.googleSite("spectrum.ieee.org", q)],
    ["Jobs", () => IEEE.links.jobs]
  ];
  let scope = 0;
  function renderSearchScopes() {
    $("searchScopes").innerHTML = SCOPES.map(([n], i) => `<button type="button" class="chip btn-chip ${i === scope ? "s3" : ""}" data-i="${i}">${h(n)}</button>`).join("");
    $("searchScopes").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { scope = +b.dataset.i; renderSearchScopes(); }));
    if (!$("searchInput").value && state.result && state.result.target.missing[0]) $("searchInput").placeholder = "Search IEEE — e.g. " + state.result.target.missing[0].name;
  }
  $("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("searchInput").value.trim() || (state.result && state.result.target.missing[0] ? state.result.target.missing[0].name : "");
    if (!q) return;
    window.open(SCOPES[scope][1](q), "_blank", "noopener");
    track("search", { scope: SCOPES[scope][0] });
  });

  // ------------------------------------------------------------------ AI assistant (optional)
  function profileSummary() {
    const r = state.result, g = r.target;
    return {
      overall: r.overall, band: r.band.label,
      subscores: Object.fromEntries(r.parts.map((p) => [p.label, p.score])),
      skills: r.skills.slice(0, 30).map((s) => s.name),
      targetRole: g.role.title, targetMatch: g.pct,
      gaps: g.missing.slice(0, 8).map((m) => m.name + " (" + m.priority + ")"),
      topRoles: r.roles.slice(0, 3).map((x) => x.role.title + " " + x.pct + "%"),
      github: r.github ? { repos: r.github.ownRepos, stars: r.github.stars, languages: Object.keys(r.github.languages).slice(0, 6) } : null,
      resumeTips: r.resume ? r.resume.tips : []
    };
  }

  function setupChat() {
    const on = !!C.apiBase;
    $("assistant").hidden = !on; $("navAssistant").hidden = !on;
    if (!on) return;
    $("chatLog").innerHTML = "";
    const g = state.result.target;
    const sugg = [
      `Give me a 90-day plan to reach ${g.role.title}`,
      g.missing[0] ? `What's the fastest way to learn ${g.missing[0].name}?` : "Which senior roles should I target next?",
      "Which IEEE activities would strengthen my profile?",
      "Rewrite my weakest resume bullet idea"
    ];
    $("chatSuggest").innerHTML = sugg.map((s) => `<button type="button" class="chip btn-chip">${h(s)}</button>`).join("");
    $("chatSuggest").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => sendChat(b.textContent)));
  }

  function md(text) {
    // tiny, safe markdown: escape first, then **bold**, links, bullets, paragraphs
    const lines = h(text).split(/\n/);
    let html = "", inList = false;
    for (let line of lines) {
      line = line.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      const li = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
      if (li) { if (!inList) { html += "<ul>"; inList = true; } html += "<li>" + li[1] + "</li>"; continue; }
      if (inList) { html += "</ul>"; inList = false; }
      if (line.trim()) html += "<p>" + line.replace(/^#+\s*/, "") + "</p>";
    }
    if (inList) html += "</ul>";
    return html;
  }

  function addMsg(role, text, cls) {
    const div = document.createElement("div");
    div.className = "msg " + (cls || role);
    if (role === "ai") div.innerHTML = md(text); else div.textContent = text;
    $("chatLog").appendChild(div);
    $("chatLog").scrollTop = $("chatLog").scrollHeight;
    return div;
  }

  async function sendChat(text) {
    text = (text || "").trim();
    if (!text || $("chatSend").disabled) return;
    $("chatInput").value = "";
    $("chatSuggest").innerHTML = "";
    addMsg("user", text);
    state.chat.push({ role: "user", content: text });
    const pending = addMsg("ai", "Thinking…");
    $("chatSend").disabled = true;
    try {
      const res = await fetch(C.apiBase.replace(/\/$/, "") + "/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileSummary(), messages: state.chat.slice(-10) })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The assistant is unavailable right now.");
      pending.innerHTML = md(data.reply);
      state.chat.push({ role: "assistant", content: data.reply });
    } catch (err) {
      pending.className = "msg err"; pending.textContent = err.message;
      state.chat.pop();
    } finally {
      $("chatSend").disabled = false;
      $("chatLog").scrollTop = $("chatLog").scrollHeight;
    }
  }
  $("chatForm").addEventListener("submit", (e) => { e.preventDefault(); sendChat($("chatInput").value); });
})();
