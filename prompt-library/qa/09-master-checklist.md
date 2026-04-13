# Master Delivery Checklist — Phase Gates

Run this checklist before returning any QA artifact. Four sequential gates — each one is a hard stop. A single unchecked item means the artifact is not deliverable.

```
Gate 1 → runs immediately after receiving the task (before writing any test name)
Gate 2 → runs after test names are drafted (before writing any TypeScript)
Gate 3 → runs after implementation is complete (before returning the artifact)
Gate 4 → runs last as final security verification (immediately before delivery)
```

---

## Gate 1 — Requirements Lock

**When:** immediately after receiving task input.
**Blocks:** do not write any test name or `test.describe` until this gate passes.

```
□ Actors identified — who interacts with the feature?

□ Every acceptance criterion explicitly listed and numbered:
    AC-01: ...
    AC-02: ...

□ ISTQB technique selected for each AC:
    Input has discrete categories?       → Equivalence Partitioning (EP)
    Input has numeric/date ranges?       → Boundary Value Analysis (BVA)
    Multiple conditions combined?        → Decision Table
    Stateful workflow with transitions?  → State Transition
    User-facing flow with alternatives?  → Use Case Testing

□ Estimated test count documented before writing code:
    Minimum: 1 happy path + 1 negative per AC

□ Every ambiguity flagged: // [CLARIFY: specific question]
    Do not assume. Do not invent behavior not stated.

□ Every assumption flagged: // [ASSUMED: reason — verify with stakeholder]

□ Security boundary identified:
    Does this feature involve authentication?    → security tests required in Gate 3
    Does this feature accept user input?         → injection tests required in Gate 3
    Does this feature have resource ownership?   → IDOR test required in Gate 3
```

**Gate 1 failure:** missing ACs, no technique selected, unresolved ambiguities. Stop and clarify before proceeding.

---

## Gate 2 — Design Lock

**When:** after test names are drafted, before writing any TypeScript.
**Blocks:** do not open a `.spec.ts` file until this gate passes.

```
□ Coverage matrix complete — every AC has ≥ 2 entries:

    | AC    | Happy Path | Negative | Edge/Boundary | Security    |
    |-------|-----------|---------|--------------|-------------|
    | AC-01 | ✅         | ✅       | ✅ BVA       | ✅ if auth  |
    | AC-02 | ✅         | ✅       | —            | —           |

    Rule: no AC may have fewer than 2 total tests.

□ Every test name follows the mandatory format:
    should [observable outcome] when/given/if [condition]

    Rejected names:
    ✗ "click login button"    (action, not outcome)
    ✗ "login test"            (vague)
    ✗ "TC-001"                (ID without behavior)
    ✗ "verify login works"    (outcome missing)

□ Tags assigned to every test:
    @smoke      on critical-path tests (at least one per feature)
    @regression on full-coverage tests
    @security   on security-specific tests
    @req:AC-ID  where the AC number is known

□ Data requirements identified:
    Factory functions named: createUserPayload(), createProductPayload()...
    Environment variables listed and added to .env.example
    No hardcoded emails, passwords, or IDs visible in the design

□ Pyramid proportions checked:
    E2E tests ≤ 15 per feature
    Logic testable via API is NOT written as E2E
    No E2E where a unit test would suffice
```

**Gate 2 failure:** AC missing from matrix, test names describe actions, missing tags, literal data in design. Fix before writing code.

---

## Gate 3 — Implementation Lock

**When:** after all test code is written, before returning the artifact.
**Blocks:** do not deliver until this gate passes.

### 3a — Compilation & Forbidden Patterns

```
□ TypeScript strict compilation:
    tsc --noEmit --strict → 0 errors, 0 implicit 'any'

□ Forbidden patterns absent:
    grep -rn 'waitForTimeout'          tests/ → 0 matches
    grep -rn 'test\.only\|it\.only'   tests/ → 0 matches
    grep -rn 'eval(\|exec('           tests/ fixtures/ → 0 matches

□ All process.env accesses throw explicitly on missing:
    Forbidden: process.env.VAR ?? undefined
    Forbidden: process.env.VAR ?? ''
    Required:  process.env.VAR ?? (() => { throw new Error('VAR is required') })()
```

### 3b — API Tests

```
□ Status code validated with exact value (toBe(201), never toBeLessThan(400))
□ Schema defined for every API response (additionalProperties: false)
□ No sensitive fields exposed in response assertions
□ Content-Type: application/json validated on every JSON response
□ Negative tests present for each endpoint:
    □ 401 — missing or invalid auth
    □ 403 — insufficient permissions
    □ 404 — resource not found
    □ 400/422 — invalid input
□ Fixtures used (api/adminApi/anonApi) — never request.newContext() inside test
□ Factories used — unique email (uuid) per test, no literal objects
□ Cleanup in afterEach for every resource created in beforeEach
```

### 3c — E2E Tests

```
□ Locator priority respected:
    getByRole > getByLabel > getByText > getByPlaceholder > getByTestId > locator(css)
    No XPath. CSS selectors documented with reason if used.
□ storageState used for auth — never UI login in beforeEach
□ AAA comments in every test: // Arrange ... // Act ... // Assert
□ No hardcoded URLs — process.env.BASE_URL everywhere
□ Page Object used for pages with > 5 interactions
□ At least one assertion on a business outcome per test
    (URL change, text content, element state — not "page loaded")
```

### 3d — Security Tests (run if Gate 1 flagged a security boundary)

```
□ IDOR test: user B cannot access user A's owned resource → expect([403, 404])
□ Privilege escalation: self-update to admin role → expect(403)
□ Auth bypass: every protected endpoint returns 401 without token
□ SQL injection: no endpoint returns 500 for any payload
□ XSS: stored content does not contain <script>, onerror=, javascript:
□ Security headers present: HSTS, CSP, X-Content-Type-Options, X-Frame-Options
□ Account lockout: N failed attempts → access denied even with correct password
□ User enumeration: identical error for valid and invalid email
```

### 3e — Performance Tests (run if SLA defined in requirements)

```
□ Explicit SLA referenced — no invented thresholds
□ Thresholds defined in options BEFORE test body
□ p(95) used as SLA gate — never average or p(100)
□ Auth from environment variable — never hardcoded
□ Smoke test present and separate from load/stress
```

**Gate 3 failure:** any TypeScript error, any forbidden pattern, any missing schema, any missing negative test. Fix and re-run the gate.

---

## Gate 4 — Delivery Lock

**When:** immediately before returning the artifact. This is the final check.

### 4a — Security (non-negotiable)

```
□ No credentials hardcoded in any file:
    grep -rn 'password\s*=\s*["\x27][^"\x27]' tests/ fixtures/ → 0 matches

□ No API keys or tokens in source:
    grep -rn 'sk-ant-\|ghp_\|AKIA\|Bearer [a-zA-Z0-9]\{20,\}' tests/ → 0 matches

□ All secrets use process.env with explicit throw on missing

□ .gitignore present and includes:
    .env, .env.*, .auth/, node_modules/, playwright-report/,
    test-results/, *.log, coverage/

□ .env.example exists with ALL variable names and placeholder values

□ No exec(), eval(), child_process in any generated test file
```

### 4b — Supply Chain (run for new projects or CI changes)

```
□ package-lock.json committed and up to date
□ npm audit --audit-level=high → 0 HIGH or CRITICAL vulnerabilities
□ npm ci used in CI (not npm install) — enforces lock file
```

### 4c — Architecture (run for new projects or structure changes)

```
□ playwright.config.ts present with: forbidOnly, retries, baseURL
□ CI pipeline YAML present with multi-stage structure and quality gates
□ Secrets referenced from CI secret store — never hardcoded in YAML
```

### 4d — Final Sign-Off

Answer all six questions before returning the artifact. All must be YES or N/A.

```
1. Can every test run completely alone, in any order?
   YES / NO — if NO, fix isolation before delivering.

2. Does every test have at least one assertion that can actually fail
   if the system behaves incorrectly?
   YES / NO — if NO, add meaningful assertions.

3. Is there any hardcoded credential, token, or API key anywhere?
   NO required — if YES, move to process.env immediately.

4. Is there any page.waitForTimeout() in the code?
   NO required — if YES, replace with proper assertions.

5. Does every API response test validate the schema?
   YES / NO / N/A — if NO, add schema validation.

6. Is there a negative test for every positive test?
   YES / NO — if NO, add the missing error scenarios.
```
