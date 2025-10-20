# Portfolio Site Plan — hackall360.github.io

## Vision
Create a **tech-forward, professional, high-performance** personal site that presents **Sponge (hackall360)** as a:
- Software Developer
- Security Professional
- Full-Stack Engineer
- ML / AI Specialist
- Prompt Engineer
- Fast-learning systems thinker who builds **scalable, secure, and consumer-friendly** AI-integrated web solutions.

The design and tone should *imply* — not state —  
> “I build clean, functional systems that merge web technology with artificial intelligence to create usable, scalable products.”

---

## Goals
1. Present a unified professional identity across software, AI, and security.
2. Demonstrate technical depth through curated projects and concise case studies.
3. Automate portfolio updates using GitHub Actions + GitHub API.
4. Maintain an aesthetic that feels futuristic, minimal, and *engineered*, not “personal bloggy”.
5. Optimize for speed (Lighthouse 95+), accessibility, and long-term maintainability.

---

## Stack
| Area | Tech | Notes |
|------|------|-------|
| Static Site Framework | **Astro** | Fast, modern, minimal JavaScript; integrates with Markdown and APIs. |
| Styling | **TailwindCSS** | Utility-first, dark mode by default, accent color cyan/blue. |
| Build Automation | **GitHub Actions** | Runs build + deploy to `gh-pages`. Daily rebuild to refresh repo data. |
| Data Source | **GitHub REST API** | Auto-fetch public repos, filter featured projects. |
| Hosting | **GitHub Pages** | Free, integrated, supports custom domains. |
| Optional Enhancements | **Framer Motion**, **Lottie animations**, **Recharts** | For subtle motion, data visualization in case studies. |

---

## Structure

### `/` (Home)
**Purpose:** Immediate professional impression — who you are, what you build, and why it matters.

- Hero:  
  `Sponge (hackall360)`  
  _Full-stack and ML engineer designing secure, scalable AI systems for the web._  
  Subtext: fast, efficient, forward-looking.  
  CTA: “View Projects” + “About Me”.

- Featured Projects Section (3–5 cards):  
  Each card pulls from `projects.json` generated via GitHub API.  
  Include:
  - Project title  
  - Short tagline (“Agent UI for AI coding workflow”)  
  - Tags (AI, Security, Full-Stack, etc.)  
  - Buttons: “View Code”, “Read Case Study”

- Highlight Metrics:  
  “20+ public projects” / “7 years combined experience” / “1 mindset: build fast, build right.”

---

### `/projects`
**Purpose:** Portfolio depth.

- All repos auto-listed from `projects.json`.  
- Filters: `AI`, `Security`, `Full-Stack`, `Utility`.  
- Grid layout, hover effects, badges for language and stars.  
- Each card links to `/projects/{slug}` — a generated Markdown case study if available, or fallback to repo README.

---

### `/about`
**Purpose:** Context and credibility.

- Short narrative bio (third-person, professional):  
  > Sponge is a software developer and security engineer who builds scalable AI-integrated systems across the stack. He blends offensive/defensive security experience with a deep interest in machine learning, automation, and prompt engineering.
- Skills diagram or list grouped by domain:
  - Frontend: React, Next.js, Astro, TailwindCSS  
  - Backend: Python, FastAPI, Node.js, Flask, PostgreSQL  
  - AI/ML: PyTorch, LangChain, OpenAI, LlamaIndex  
  - Security/Infra: Docker, Nginx, Burp Suite, Kali, Linux hardening  
- Contact links: email, LinkedIn, GitHub, (optional) calendar link.

---

### `/now` (Optional)
Short updates — what you’re currently building or learning.
Keeps the site feeling alive and self-updating.

---

### `/blog` or `/notes` (Optional)
Markdown-based lab notes on experiments and optimizations:
- “Deploying scalable AI inference APIs”
- “Building an LLM agent with security constraints”
- “Prompt engineering beyond templates”

Each entry = short, practical, technical insight.

---

## Design Language
- **Primary:** Dark background, neutral gray text, cyan/blue highlights.  
- **Feel:** Technical, precise, confident — evokes AI and cybersecurity tools, not marketing fluff.  
- **Typography:** System fonts, monospace accent for code terms.  
- **Layout:** Centered grid, large gutters, terminal-style nav.  
- **Motion:** Subtle transitions (fade-in, hover glows).  
- **Accessibility:** High contrast; color-blind-friendly palette.  

Visual message: *“This person builds robust, performant systems that feel futuristic but reliable.”*

---

## Automation
### GitHub Actions Workflow
- Trigger on:
  - `push` to `main`
  - `schedule`: daily at 01:00 UTC
- Steps:
  1. Checkout repo
  2. Install dependencies
  3. Run script `scripts/fetch-projects.mjs`  
     → Queries GitHub API for `hackall360` public repos  
     → Outputs `src/data/projects.json`
  4. Run `astro build`
  5. Deploy to GitHub Pages

Optional: Cache API results and images for speed.

---

## SEO / Metadata
- `<title>`: “Sponge (hackall360) — Software, AI, and Security Engineering”  
- `<meta name="description">`: “Full-stack and ML engineer building secure, scalable AI-integrated systems.”  
- OpenGraph + Twitter cards with banner image.  
- JSON-LD schema (`Person`) for search engines.

---

## Timeline
| Phase | Task | ETA |
|--------|------|-----|
| Phase 1 | Astro setup + Tailwind + GitHub Actions deploy | Day 1 |
| Phase 2 | Data script + Featured projects grid | Day 2 |
| Phase 3 | About page + case study template | Day 3–4 |
| Phase 4 | Visual polish + SEO + Lighthouse optimization | Day 5 |
| Phase 5 | Optional blog/notes integration | Week 2 |

---

## Long-Term Plans
- Add analytics (Plausible or simple server logs).  
- Integrate a contact form (Formspree or serverless function).  
- Build an **AI portfolio assistant** section: a chatbot trained on your repos and write-ups.  
- Optionally mirror on a personal domain once one is registered, keeping GitHub Pages as the default in the meantime.

---

## Summary
This site should communicate—through its structure, tone, and performance—that you:
- Build technology that is fast, secure, and scalable.  
- Integrate AI into real-world systems with attention to UX and functionality.  
- Bridge software engineering, machine learning, and security into one cohesive craft.

**End result:** a living portfolio that looks and feels like the front page of an engineering lab, not a résumé.

