# CareerAtlas AI — IEEE YP Summit edition

An AI career companion that runs as a static website. It reads a person's resume, LinkedIn PDF and GitHub, then shows:

- a career score
- role matches and gaps, with a what-if simulator
- an IEEE learning path
- mentor matches
- a global IEEE search

**Cost: $0 to host.** All analysis runs in the visitor's browser. The optional AI chat is the only part that costs anything, and only per chat.

```
careeratlas/
├── index.html          ← the app
├── config.js           ← the only file you normally edit
├── css/app.css
├── js/engine.js        ← parsing, scoring, gap analysis, matching
├── js/app.js           ← UI
├── data/               ← skills, roles, IEEE resources, sample mentors, sample profile
└── worker/             ← OPTIONAL Cloudflare Worker (AI chat + usage stats)
```

---

## 1. Put it online (free): GitHub Pages

1. Create a GitHub repo, e.g. `careeratlas`, and upload everything in this folder.
2. Open **Settings → Pages**. Set Source to *Deploy from a branch*, Branch to `main`, Folder to `/ (root)`.
3. After about a minute it's live at `https://<your-username>.github.io/careeratlas/`.

Any static host also works: Cloudflare Pages, Netlify, or the summit site's own hosting. Just upload the folder.

## 2. Add it to the summit website

Pick one:

- **Link it** from the summit menu: "Career Navigator" → your GitHub Pages URL. This is the simplest option.
- **Embed it** on a summit page:
  ```html
  <iframe src="https://<your-username>.github.io/careeratlas/"
          style="width:100%;height:1400px;border:0" title="CareerAtlas AI"></iframe>
  ```
  This works with WordPress (Custom HTML block), Wix (Embed → Embed a site), Squarespace (Code block) and plain HTML sites.
- **Host it inside the summit site.** Copy the folder to e.g. `/career-navigator/` on the same server. All paths are relative.

## 3. Mentors: free opt-in via Google Forms

1. Create a Google Form asking for these fields:
   - **name**
   - **title**
   - **organization**
   - **grade** (e.g. IEEE Senior Member)
   - **location**
   - **skills**: comma-separated. Use names from `data/skills.js`, e.g. `Machine Learning, MLOps, Python`.
   - **roles** (optional): role ids from `data/roles.js`, e.g. `ml, genai`.
   - **contact**: an IEEE Collabratec or LinkedIn URL, or an email.
2. Open the linked Google Sheet. Clean the header names to the words above, or keep them; matching is by keyword.
3. In the Sheet, go to **File → Share → Publish to web**, choose the sheet and **CSV**, then copy the link.
4. In `config.js`, set `mentorSheetCsv` to that link and `mentorSignupUrl` to the Form link.

Until you do this, the app shows clearly labelled **Sample** mentors (fictional).

> Only publish mentors who agreed to be listed. Ask for consent in the Form.

## 4. Optional: AI chat + usage stats (Cloudflare Worker, free tier)

The worker keeps your Claude API key secret, limits chats per visitor per day, and counts anonymous usage. The counts cover visits, analyses, mentor clicks, resource clicks and chats, and give you the impact numbers for reports.

```bash
cd worker
npm i -g wrangler          # or use npx
wrangler login
wrangler kv namespace create CA_KV      # paste the id into wrangler.toml
# edit wrangler.toml → ALLOWED_ORIGINS = your summit site + GitHub Pages origin
wrangler secret put ANTHROPIC_API_KEY   # from console.anthropic.com
wrangler secret put STATS_KEY           # any password you choose
wrangler deploy
```

Then set `apiBase` in `config.js` to the worker URL it prints. The **AI career assistant** section and the usage tracking switch on automatically.

- **Cost:** The Workers and KV free tiers cover summit-scale traffic. Claude usage is billed per message; with a small model, each chat is a fraction of a cent. `DAILY_CHAT_LIMIT` caps the spend.
- **Usage report:** open `https://<worker-url>/stats?key=<STATS_KEY>`. It returns totals and per-day counts.

## 5. Customize

| What | Where |
|---|---|
| Name, event, privacy text | `config.js` |
| Skills the engine detects (with aliases) | `data/skills.js` |
| Target roles and skill weights (3 core / 2 important / 1 nice) | `data/roles.js` |
| IEEE societies, standards and links used for recommendations | `data/ieee.js` |
| Score weights and resume rules | `js/engine.js` → `analyze()` / `scoreResume()` |

## How it maps to the pitch architecture

| Pitch | This build |
|---|---|
| Inputs: Resume, LinkedIn, GitHub | Resume PDF/TXT, LinkedIn "Save to PDF", GitHub public API (no scraping) |
| IEEE knowledge assets | `data/ieee.js`: IEEE Learning Network, IEEE Xplore papers and standards, societies, IEEE.tv, vTools events, Job Site |
| RAG engine + Claude | Deterministic skill/role engine in the browser. Claude is used only for the optional chat, grounded on the analysis summary. |
| Dashboard | Career score, sources, role matches, next steps, gap analysis, simulator, resume and GitHub analyzers, learning path, mentors, global search, assistant |

**Roadmap after the summit:**

- Get an IEEE Xplore API key and pull live paper results.
- Get an official IEEE Learning Network course catalog to replace the search links.
- Get Collabratec or member-directory access through IEEE for mentor matching at scale.
- Add semantic matching with embeddings.

## Privacy

- Resume and LinkedIn files are parsed in the browser with pdf.js and are never uploaded.
- The GitHub lookup calls GitHub's public API directly from the browser.
- When the AI chat is enabled, the browser sends only the computed summary (scores, skill names, gaps), not the resume text.
- Usage counters store event counts only. They store no personal data.
