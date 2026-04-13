# Test Design Techniques (ISTQB Applied)

Apply these techniques before writing a single test name. Selecting the right technique for each acceptance criterion determines whether your coverage is systematic or accidental.

**Prerequisite:** Gate 0 must pass (`00-protocol.md`). If you cannot complete Step 1 from the information provided, the input is insufficient — collect requirements before proceeding.

---

## Requirement Analysis — Mandatory Protocol

Execute this protocol BEFORE writing any test. Do not skip steps. Do not assume what is not stated.

```
STEP 1 — IDENTIFY
  □ Actors (who interacts with the system)
  □ Main flows (happy paths per acceptance criterion)
  □ Alternative flows (valid but non-primary paths)
  □ Exception flows (invalid inputs, system errors)
  □ Implicit business rules — mark each as [IMPLICIT]
  □ Ambiguities — mark each as [CLARIFY: question]

STEP 2 — SELECT TECHNIQUES (one or more)
  Input has discrete categories?       → Equivalence Partitioning
  Input has numeric/date ranges?       → Boundary Value Analysis
  Multiple conditions combined?        → Decision Table (≥ 2 conditions)
  Stateful workflow with transitions?  → State Transition
  User-facing flow with alternatives?  → Use Case Testing

STEP 3 — ESTIMATE MINIMUM COVERAGE
  1 test per acceptance criterion (happy path)
  ≥ 2 tests per validation rule (invalid input, boundary)
  1 test per exception flow
  1 security test per auth/input boundary
  Total: document count before writing code
```

---

## Technique 1: Equivalence Partitioning (EP)

Divide inputs into partitions where any value in a partition produces the same result. Test one representative value per partition — not every possible value.

```
Valid partition   → expected behavior, system accepts input
Invalid partition → system rejects input, shows error, returns 4xx

Common partitions by type:
  String: empty | too short | valid | too long | special chars | unicode
  Number: negative | zero | valid range | above max
  Email:  missing @ | missing domain | valid | SQL injection payload
  File:   no file | wrong format | valid | exceeds size limit
  Date:   past | today | future | invalid format | non-existent date
```

**Example: Email field**

```typescript
const emailPartitions = [
  { partition: 'empty',       value: '',                         expectedStatus: 422 },
  { partition: 'no-at-sign',  value: 'useratexample.com',       expectedStatus: 422 },
  { partition: 'no-domain',   value: 'user@',                   expectedStatus: 422 },
  { partition: 'spaces',      value: 'user @example.com',       expectedStatus: 422 },
  { partition: 'too-long',    value: 'a'.repeat(245) + '@b.com', expectedStatus: 422 },
  { partition: 'valid-email', value: 'user@example.com',        expectedStatus: 201 },
];

for (const { partition, value, expectedStatus } of emailPartitions) {
  test(`should return ${expectedStatus} for email partition: ${partition}`, async ({ api }) => {
    const res = await api.post('/users', {
      data: { email: value, password: 'Valid@123', name: 'Test' },
    });
    expect(res.status()).toBe(expectedStatus);
  });
}
```

---

## Technique 2: Boundary Value Analysis (BVA)

Test at the exact boundaries of valid/invalid ranges. Always test: min-1, min, max, max+1.

```
Range: [min, max]
Test: min-1  →  expected to be INVALID (just outside lower bound)
Test: min    →  expected to be VALID   (lower boundary, inclusive)
Test: max    →  expected to be VALID   (upper boundary, inclusive)
Test: max+1  →  expected to be INVALID (just outside upper bound)
```

**Example: Password length (8–72 characters)**

```typescript
const passwordBoundaries = [
  { label: 'min-1 (7 chars)',   value: 'Aa1!'.padEnd(7, 'x'),  valid: false },
  { label: 'min   (8 chars)',   value: 'Aa1!'.padEnd(8, 'x'),  valid: true  },
  { label: 'max   (72 chars)',  value: 'Aa1!'.padEnd(72, 'x'), valid: true  },
  { label: 'max+1 (73 chars)',  value: 'Aa1!'.padEnd(73, 'x'), valid: false },
];

for (const { label, value, valid } of passwordBoundaries) {
  test(`should ${valid ? 'accept' : 'reject'} password at boundary: ${label}`, async ({ api }) => {
    const res = await api.post('/auth/register', {
      data: { email: `bva-${Date.now()}@test.com`, password: value },
    });
    expect(res.status()).toBe(valid ? 201 : 422);
  });
}
```

**Example: Pagination (page ≥ 1, limit 1–100)**

```typescript
const paginationBVA = [
  { page: 0,  limit: 10,  valid: false }, // page min-1
  { page: 1,  limit: 10,  valid: true  }, // page min
  { page: 1,  limit: 0,   valid: false }, // limit min-1
  { page: 1,  limit: 1,   valid: true  }, // limit min
  { page: 1,  limit: 100, valid: true  }, // limit max
  { page: 1,  limit: 101, valid: false }, // limit max+1
];
```

---

## Technique 3: Decision Tables

Use when 2 or more conditions combined determine the output.

```
Signal: "IF condition A AND/OR condition B THEN..."
         "Depending on X and Y, the system..."
         Business rules with multiple factors
```

**Example: Discount rules**

```
Conditions:
  C1: User is premium member  (Y/N)
  C2: Cart total ≥ $100       (Y/N)
  C3: Has active promo code   (Y/N)
```

| C1 Premium | C2 ≥$100 | C3 Promo | Expected |
|---|---|---|---|
| Y | Y | Y | 15% |
| Y | Y | N | 10% |
| Y | N | Y | 10% |
| Y | N | N | 5%  |
| N | Y | Y | 10% |
| N | Y | N | 5%  |
| N | N | Y | 5%  |
| N | N | N | 0%  |

```typescript
const discountScenarios = [
  { premium: true,  total: 150, promo: 'PROMO10', expectedDiscount: 15 },
  { premium: true,  total: 150, promo: null,       expectedDiscount: 10 },
  { premium: true,  total: 50,  promo: 'PROMO10', expectedDiscount: 10 },
  { premium: true,  total: 50,  promo: null,       expectedDiscount: 5  },
  { premium: false, total: 150, promo: 'PROMO10', expectedDiscount: 10 },
  { premium: false, total: 150, promo: null,       expectedDiscount: 5  },
  { premium: false, total: 50,  promo: 'PROMO10', expectedDiscount: 5  },
  { premium: false, total: 50,  promo: null,       expectedDiscount: 0  },
];

for (const { premium, total, promo, expectedDiscount } of discountScenarios) {
  test(
    `should apply ${expectedDiscount}% discount: premium=${premium}, total=${total}, promo=${promo ?? 'none'}`,
    async ({ api }) => {
      const res = await api.post('/cart/calculate', {
        data: { userId: premium ? premiumUserId : regularUserId, total, promoCode: promo },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.discountPercent).toBe(expectedDiscount);
    }
  );
}
```

---

## Technique 4: State Transition

Use when the system has states and transitions between them.

```
Signal: "status changes from X to Y when..."
         "workflow with stages: pending → approved → published"
         "account can be: active, locked, suspended, deleted"
```

**Example: Order status**

```
States: pending → confirmed → shipped → delivered
                ↘ cancelled (from pending or confirmed only)
                             ↘ returned (from delivered only)

Valid transitions:
  pending   + confirm  → confirmed
  pending   + cancel   → cancelled
  confirmed + ship     → shipped
  confirmed + cancel   → cancelled
  shipped   + deliver  → delivered
  delivered + return   → returned

Invalid transitions (must reject with 400/409/422):
  delivered + cancel   → ERROR
  shipped   + cancel   → ERROR
  cancelled + ship     → ERROR
```

```typescript
// Valid transition
test('should transition order from pending to confirmed', async ({ api }) => {
  const orderId = await createOrder(api, 'pending');
  const res = await api.patch(`/orders/${orderId}`, { data: { action: 'confirm' } });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe('confirmed');
});

// Invalid transition — system must reject
test('should reject cancellation of a shipped order', async ({ api }) => {
  const orderId = await createOrder(api, 'shipped');
  const res = await api.patch(`/orders/${orderId}`, { data: { action: 'cancel' } });
  expect([400, 409, 422]).toContain(res.status());
  const body = await res.json();
  expect(body.error).toMatch(/cannot cancel|invalid transition/i);
});
```

---

## Technique 5: Use Case Testing

Structure tests around the main flow, alternatives, and exceptions from each use case.

```
Main Flow (Basic Path):        → 1 test, tagged @smoke
Alternative Flow N:            → 1 test per alternative
Exception Flow N (errors):     → 1+ tests per exception
```

**Example: User Login**

```
Main Flow:
  1. User navigates to /login
  2. Enters valid credentials
  3. System validates → redirects to /dashboard
→ Test: should redirect to dashboard after login with valid credentials @smoke

Alternative Flow A1 — Remember Me:
  User checks "Remember me" → session persists across browser restart
→ Test: should persist session when remember-me is selected

Exception Flow E1 — Invalid credentials:
  Validation fails → error shown, user stays on /login
→ Test: should display error message when credentials are invalid

Exception Flow E2 — Account locked:
  Account exceeded failed attempt limit → locked message shown
→ Test: should show lockout message for locked accounts
```

---

## Minimum Coverage Matrix

Document this matrix BEFORE writing any test. Leave no AC uncovered.

| Acceptance Criterion | Happy Path | Negative | Edge / Boundary | Security |
|---|---|---|---|---|
| AC-01: Login succeeds | ✅ | ✅ invalid creds | ✅ BVA password | ✅ brute force |
| AC-02: Error message shown | ✅ | — | ✅ empty fields | — |
| AC-03: Redirect to dashboard | ✅ | ✅ wrong role | — | ✅ open redirect |

**Rule: no acceptance criterion may have fewer than 2 tests total.**
If you have only 1 test per AC, you are missing the negative case.
