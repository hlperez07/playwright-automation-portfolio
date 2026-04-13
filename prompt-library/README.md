# Prompt Library

A version-controlled library of grounding documents for AI-assisted QA engineering.

## What are these?

These are not simple prompts to copy-paste into a chat interface. They are **grounding documents** — structured rule sets that tell an AI model exactly what to generate, what patterns to follow, and what to never produce.

The difference matters:

| Simple prompt | Grounding document |
|---|---|
| "Write a Playwright test for login" | "Use `getByRole` before `getByLabel`. Never use `waitForTimeout`. Every test name must start with `should [outcome] when [condition]`. Never place assertions inside Page Objects." |

The result is deterministic, hallucination-free output that already follows the team's standards before any human review.

## Structure

```
prompt-library/
├── qa/                          ← QA methodology: gates, ISTQB, quality standards
│   ├── 00-protocol.md           ← Entry point: input gates, security rules, quality definition
│   ├── 02-test-design.md        ← ISTQB techniques: EP, BVA, Decision Tables, State Transition
│   └── 09-master-checklist.md  ← 4-gate delivery checklist (Requirements → Design → Impl → Delivery)
└── playwright/                  ← Playwright-specific patterns for TypeScript
    ├── page-objects.md          ← POM: typed locators, fixture injection, anti-patterns
    ├── locators.md              ← 7 semantic locators in priority order, filtering, chaining
    └── retries-flakiness.md    ← Retry strategy, flaky test root cause, serial groups
```

## How to use

**With GitHub Copilot / Claude / ChatGPT:**
1. Open the relevant document from the table below
2. Paste it as system context or attach it to your conversation
3. State your task — the AI will follow the documented rules
4. Review the output. You own the final code, not the model.

**With Claude Code or Cursor:**
Reference the skill files in your project context (CLAUDE.md or `.cursorrules`) so the AI applies them automatically for every test generation task.

## Skill Index

| Document | Use when |
|---|---|
| `qa/00-protocol.md` | Starting any QA task — defines whether you have enough input to begin |
| `qa/02-test-design.md` | Designing test coverage using ISTQB techniques (EP, BVA, Decision Tables) |
| `qa/09-master-checklist.md` | Reviewing or delivering any test artifact — 4 sequential quality gates |
| `playwright/page-objects.md` | Generating or reviewing Page Object classes in TypeScript |
| `playwright/locators.md` | Writing or auditing any Playwright locator strategy |
| `playwright/retries-flakiness.md` | Configuring retries or diagnosing a flaky test |

## Principles

- **Human-in-the-loop**: AI generates drafts. I review, refine, and own every line before it ships.
- **No black boxes**: every AI-suggested change must be understandable and maintainable by a teammate.
- **Security first**: never paste credentials, client code, or proprietary business logic into public LLMs.
- **Grounding over prompting**: a structured rule document produces better output than a detailed natural-language request, every time.
