# Playwright Automation Portfolio

<!-- Badges -->

[![CI](https://github.com/hlperez07/hlperez-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/hlperez07/hlperez-portfolio/actions)
[![Tests](https://img.shields.io/badge/tests-32%20total-ff6b35?style=flat-square&logo=playwright&logoColor=white)](https://hlperez07.github.io/hlperez-portfolio/report/)
[![Pass Rate](https://img.shields.io/badge/pass%20rate-72%25-3fb950?style=flat-square&logo=playwright&logoColor=white)](https://hlperez07.github.io/hlperez-portfolio/report/)
[![E2E](https://img.shields.io/badge/E2E-20-ff6b35?style=flat-square&logo=playwright&logoColor=white)](https://hlperez07.github.io/hlperez-portfolio/report/)
[![API](https://img.shields.io/badge/API-12-58a6ff?style=flat-square&logo=playwright&logoColor=white)](https://hlperez07.github.io/hlperez-portfolio/report/)
[![License](https://img.shields.io/badge/license-MIT-8b949e?style=flat-square)](LICENSE)

[Portfolio ↗](https://hlperez07.github.io/hlperez-portfolio/) · [Custom Report ↗](https://hlperez07.github.io/hlperez-portfolio/report/) · [Allure ↗](https://hlperez07.github.io/hlperez-portfolio/allure/)

---

## About

This project is a portfolio for a QA automation engineer demonstrating production-quality test automation against [OrangeHRM](https://opensource-demo.orangehrmlive.com), an open-source HR management system. It is intentionally built to serve as a reference for real-world test architecture rather than a tutorial or a toy.

The project demonstrates layered API + E2E test coverage, a clean Page Object Model architecture, fixture-based dependency injection, and a fully automated CI/CD pipeline that generates and publishes an Allure trend report on every push. Every design decision prioritises maintainability, isolation, and speed over convenience shortcuts.

---

## Architecture

```
hlperez-portfolio/
├── .github/workflows/ci.yml     # GitHub Actions: test + Allure report deploy
├── src/
│   ├── api/                     # Typed API client wrappers
│   ├── factories/               # Test data builders (unique per run)
│   ├── fixtures/                # Playwright fixture chain (api → base)
│   ├── pages/                   # Page Object Model classes
│   └── types/                   # TypeScript interfaces for API payloads
├── tests/
│   ├── auth.setup.ts            # Playwright setup project: saves storageState
│   ├── api/                     # API-layer tests (no browser)
│   └── e2e/                     # End-to-end UI tests
├── test-data/
│   └── categories.json          # Allure failure classification rules
└── playwright.config.ts         # Runner config: projects, reporter, timeouts
```

---

## Tech Stack

| Technology      | Version | Purpose                                        |
| --------------- | ------- | ---------------------------------------------- |
| Playwright Test | ^1.52   | Test runner + browser automation + API testing |
| TypeScript      | ^5.4    | Static typing, strict mode                     |
| Allure Report   | 3.6.0   | Test reporting with trend history              |
| GitHub Actions  | —       | CI pipeline                                    |
| GitHub Pages    | —       | Hosted Allure report                           |

---

## Test Coverage

| Module           | E2E    | API    | Total  |
| ---------------- | ------ | ------ | ------ |
| Authentication   | 5      | 0      | 5      |
| PIM (Employees)  | 6      | 5      | 11     |
| Leave Management | 4      | 3      | 7      |
| Recruitment      | 5      | 4      | 9      |
| **Total**        | **20** | **12** | **32** |

---

## Local Setup

```bash
# Prerequisites: Node.js >= 20
git clone https://github.com/hlperez07/hlperez-portfolio.git
cd hlperez-portfolio
npm ci
npx playwright install chromium
cp .env.example .env  # optional: defaults to public OrangeHRM demo
```

---

## Running Tests

```bash
npm test                    # all tests
npm run test:e2e            # E2E only
npm run test:api            # API only
npm run test:headed         # E2E with visible browser
npm run allure:generate     # generate Allure report locally
npm run allure:open         # open local report in browser
```

---

## CI/CD

The pipeline runs automatically on every push and pull request to `main`.

Steps:

1. Lint and typecheck (blocks the test job on failure)
2. Installs dependencies and the Chromium browser
3. Runs all 32 tests (E2E + API) against the OrangeHRM demo instance
4. Uploads raw test results and Allure results as artifacts (retained 30 days)
5. Generates an Allure report with trend history from the `gh-pages` branch
6. Generates a custom HTML report with pass-rate trend chart and source links
7. Deploys everything to GitHub Pages automatically

Report and test results are always generated and deployed — even when tests fail — so failures are always visible and traceable.

[View Actions runs](https://github.com/hlperez07/hlperez-portfolio/actions)

---

## Design Decisions

- **Worker-scoped auth**: one API session is created per worker, not per test. This eliminates repeated login overhead while keeping sessions isolated across parallel workers.
- **No test cleanup**: the OrangeHRM demo environment resets hourly and all factories generate unique IDs per run, so leftover data never causes collisions and cleanup logic never breaks tests.
- **API-first data setup**: factories create prerequisite data through the API before E2E tests run. This decouples test speed from UI navigation and makes data creation deterministic.
- **Semantic locators only**: every locator uses `getByRole`, `getByLabel`, or `getByText`. No CSS selectors or XPath. This makes the suite resilient to visual redesigns that do not change the semantic structure of the page.

---

## AI-Augmented Practices

| Practice | Approach |
|---|---|
| Test generation | Grounding documents constrain the AI to correct Playwright patterns — no hallucinated APIs, no CSS selectors |
| Locator strategy | Skill-guided rules enforce semantic locators (`getByRole`, `getByLabel`) in every generated test |
| Flakiness review | Structured skill document identifies race conditions and retry anti-patterns before tests ship |
| Documentation | AI-drafted JSDoc and coverage reports, human-validated before merge |

📚 [Prompt Library](./prompt-library/) — the grounding documents behind this workflow.

---

## License

MIT
