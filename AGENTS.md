# Majarrah docs — agent instructions

## About this project

- Documentation site for [Majarrah](https://majarrah.io), an AI decision engine for real estate in Saudi Arabia
- Built on [Mintlify](https://mintlify.com); pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Two locales in the product (Arabic and English), but the docs are written in English only

## What Majarrah is

Majarrah is an **AI decision engine for real estate** — not a listings aggregator. It reasons about properties and returns structured verdicts. The core output is a **decision**: a score, verdict (`match` / `partial` / `no_match`), and an optional AI-generated reasoning paragraph.

## Terminology

- **Decision** — a structured verdict on a property. Never call it a "token", "credit", "query", or "result".
- **Scoring** — the algorithmic mode (1 decision). Returns score + breakdown instantly.
- **Reasoning** — scoring + AI explanation mode (3 decisions). Adds a plain-language paragraph in Arabic or English.
- **Decision pack** — the purchase unit. Packs come in 5, 20, and 50 decisions.
- **Verdict** — the top-level output: `match`, `partial`, or `no_match`.
- **Broker** — a real estate professional using Majarrah to manage inquiries and bookings.
- **Buyer** — an end user searching for a property.

Do not use "tokens", "credits", "queries", or "AI calls" anywhere in the docs.

## Style preferences

- Active voice and second person ("you")
- Concise sentences — one idea per sentence
- Sentence case for headings
- Bold for UI labels: Click **Save**
- Code formatting for file names, commands, paths, API fields, and code references
- Plain hyphens (`-`) for dashes in copy — never em dashes (`—`)
- The 24-hour refund guarantee is a key product promise — always state it accurately; do not soften it

## Content boundaries

- Do not document internal admin or ops tooling
- Do not expose internal field names or DB schema unless they appear in the public API
- API reference lives under `/api-reference/`; platform guides live under `/buyers/`, `/brokers/`, and `/sellers/`
