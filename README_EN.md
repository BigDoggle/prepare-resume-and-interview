<div align="center">

# Prepare Resume & Interview

**Start with the evidence. Ship a resume you can actually defend in an interview.**

**English** · [简体中文](README.md)

![HTML/CSS](https://img.shields.io/badge/Resume-HTML%2FCSS-315f95?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776ab?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827?style=flat-square)

</div>

Most resume generators begin with a blank text box. This one begins with the mess you already have: source code, commits, tests, design notes, an old resume, and half-remembered project decisions.

`prepare-resume-and-interview` is a Codex Skill that reconstructs the facts before polishing the prose. It works out what you built, what the team built, and what still needs confirmation. Then it turns that evidence into resume bullets and interview material that tell the same story.

No mystery metrics. No borrowed team wins. No “led” unless the evidence can carry the word.

## What it produces

These pages came straight from the bundled `classic-blue-a4` template and were captured from the rendered HTML, one A4 page at a time. The identity, school, employer, and contact details are fictional. The portrait is AI-generated for the demo.

<p align="center">
  <img src="docs/images/resume-page-1.png" width="49%" alt="Chinese technical resume example, page 1" />
  <img src="docs/images/resume-page-2.png" width="49%" alt="Chinese technical resume example, page 2" />
</p>

## Where it earns its keep

| The awkward part | What the Skill does |
|---|---|
| You touched a feature, but “owned it” sounds too strong | Checks Git authors, refs, dates, identity aliases, and user confirmations before choosing verbs such as led, implemented, improved, or contributed |
| The commit history looks like a pile of fixes | Reconstructs the mechanism behind the fixes: state transitions, transaction boundaries, compensation paths, tests, and the invariant they protect |
| The resume sounds sharp, but the interview story falls apart after two questions | Builds project introductions, STAR stories, and follow-up questions from the same evidence ledger |
| You found a great PDF layout that is painful to edit | Measures the page, typography, spacing, portrait bounds, and pagination, then rebuilds it as searchable HTML/CSS instead of using a page-sized screenshot |
| Page two only fits after shrinking everything | Keeps one A4 spacing system across pages and moves complete semantic blocks when the content grows |
| You only asked for a preview | Builds HTML first. PDF generation waits for an explicit export request |

## Three ways to use it

### Build from the bundled template

Bring an existing resume, project notes, or a repository. Add the target role. The Skill selects a template, creates a structured content source, and renders a clean HTML resume.

```text
Use $prepare-resume-and-interview with my old resume and project repository.
Create a two-page Chinese resume for a Java backend role. Show HTML first; do not export PDF.
```

### Bring your own design

Upload a PDF, DOCX, or an existing HTML/CSS resume. A PDF acts as the visual authority; DOCX can help recover text and images. The rebuilt template remains searchable and maintainable. It is not a screenshot wearing an HTML wrapper.

```text
Use $prepare-resume-and-interview to rebuild the uploaded PDF as an HTML/CSS template.
Match the layout with sanitized demo data before adding my personal information.
```

### Turn a repository into interview material

With source code and Git history, the Skill can recover the business flow, contribution boundaries, design trade-offs, and failure modes before drafting resume bullets and interview questions.

```text
Use $prepare-resume-and-interview to inspect this repository and its Git history.
Prepare my contribution summary, project introduction, STAR stories, and follow-up questions.
```

HTML is the default handoff. When the content and layout look right, say “export PDF.” A normal export checks that the command succeeded and the file exists. Ask for a “visual audit” when you want page-by-page checks for clipping, fonts, margins, and pagination.

## The evidence ledger

The Skill sorts inputs before any claim reaches the resume:

| Mark | Meaning | Resume-ready? |
|---|---|---|
| `F` | A fact supported by source, Git, configuration, tests, formal material, or explicit confirmation | Yes |
| `R` | A reasoned interpretation with its supporting evidence preserved | After confirmation |
| `P` | A possible improvement or future design | Never as completed work |
| `U` | Ownership, metrics, launch status, or impact still awaiting confirmation | No |

That distinction matters. Fixing a concurrency bug does not automatically make someone the architect of the transaction system. The Skill can still turn the fix into a strong bullet, but it keeps the verb honest.

## Quick start

### Install

```bash
git clone https://github.com/BigDoggle/prepare-resume-and-interview.git \
  ~/.codex/skills/prepare-resume-and-interview
```

### Run the preflight

macOS / Linux:

```bash
cd ~/.codex/skills/prepare-resume-and-interview
sh scripts/preflight.sh --task resume
```

Windows PowerShell:

```powershell
cd $HOME\.codex\skills\prepare-resume-and-interview
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task resume
```

HTML resume work needs Python 3.9+ and Node.js 18+. npm, Playwright, and Chrome, Edge, or Chromium are checked only when the task needs PDF export or PDF reconstruction. The preflight reports missing capabilities; it does not install software or rewrite your PATH.

## Template commands

```bash
# Inspect and validate bundled templates
python3 scripts/template_manager.py --templates-root assets/templates list
python3 scripts/template_manager.py --templates-root assets/templates validate

# Clone a template into a personal working directory
python3 scripts/template_manager.py \
  --templates-root assets/templates \
  clone --id classic-blue-a4 \
  --destination /absolute/path/to/my-resume

# Build HTML
cd /absolute/path/to/my-resume
npm run build

# Export only after the user asks for PDF
npm run pdf
```

Real names, contacts, and portraits belong in the cloned working directory, never in the public template.

## Resume project layout

```text
resume/
├── assets/                 # Portraits, icons, and local assets
├── content/resume.json     # Single source of content truth
├── src/template.mjs        # Semantic HTML structure
├── src/styles.css          # Screen and print styles
├── scripts/build.mjs       # HTML build
├── scripts/export-pdf.cjs  # PDF export
├── dist/index.html         # Generated resume
└── output/pdf/             # PDF created after explicit request
```

`content` owns the facts, `src` owns presentation, and `dist` is disposable build output. Change the source once, then rebuild.

## Repository layout

```text
prepare-resume-and-interview/
├── SKILL.md                # Routing, evidence rules, and delivery policy
├── agents/openai.yaml      # Codex-facing metadata and default prompt
├── assets/templates/       # Sanitized public templates
├── references/             # Project, resume, template, and PDF workflows
├── scripts/                # Preflight and template utilities
└── docs/images/            # README demo assets
```

## Guardrails

- Public templates contain no real phone numbers, emails, portraits, internal URLs, or customer data.
- Personal resume projects stay outside the Skill repository by default.
- PDF export is opt-in. A visual audit is a separate request.
- The Skill never commits or pushes code without explicit permission.

## README references

The document structure borrows ideas from [Reactive Resume](https://github.com/amruthpillai/reactive-resume), [JSON Resume](https://github.com/jsonresume/resume-cli), and [Awesome README](https://github.com/matiassingers/awesome-readme). The workflow, templates, and code in this repository are maintained independently.
