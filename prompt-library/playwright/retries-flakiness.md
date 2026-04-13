# Retries & Flakiness — Playwright

Control test retries at the right granularity and use `testInfo.retry` to restore clean state before each attempt, so retries fix transient failures rather than hide permanent bugs.

---

## Required Rules

### 1. Enable retries only in CI — keep local runs at zero

Retries in local development mask real bugs and slow down the feedback loop. Gate them behind the `CI` environment variable so engineers see failures immediately on their machines, while the pipeline gets fault tolerance for genuine infrastructure flaps.

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

### 2. Clean server-side state before each retry using `testInfo.retry`

When a test creates server-side resources (orders, users, sessions) and then fails mid-flow, the next attempt starts with stale data already in the database. Check `testInfo.retry` at the top of the test and invoke the API cleanup endpoint before proceeding.

```typescript
import { test, expect } from '@playwright/test';

test('completes checkout flow', async ({ page, request }, testInfo) => {
  if (testInfo.retry > 0) {
    // Remove any order left over from the previous failed attempt
    await request.delete('/api/orders/cleanup', {
      data: { sessionId: testInfo.testId },
    });
    console.log(`Retry ${testInfo.retry} — cleaned up stale order data`);
  }

  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByLabel('Card number').fill('4111111111111111');
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});
```

### 3. Scope per-group retries for known unstable integrations

When a specific external service (payment gateway, email provider) is known to be flaky but the rest of the suite is stable, raise retries only for that group rather than globally.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Stripe webhook delivery', () => {
  test.describe.configure({ retries: 3 });

  test('payment-succeeded event is processed within 5 s', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: { type: 'payment_intent.succeeded', id: `pi_${Date.now()}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('processed');
  });
});
```

### 4. Use `test.describe.serial()` only for inherently ordered flows

`serial()` forces sequential execution and skips all remaining tests in the group when one fails. Reserve it for multi-step wizard flows where each step genuinely depends on the previous one. If tests can be made independent with proper setup, always prefer that.

```typescript
import { test, expect } from '@playwright/test';

test.describe.serial('onboarding wizard', () => {
  test('step 1: create account', async ({ page }) => {
    await page.goto('/onboarding/step-1');
    await page.getByLabel('Company name').fill('Acme Corp');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/onboarding/step-2');
  });

  test('step 2: invite teammates', async ({ page }) => {
    await page.goto('/onboarding/step-2');
    await page.getByLabel('Email').fill('teammate@acme.com');
    await page.getByRole('button', { name: 'Send invite' }).click();
    await expect(page.getByText('Invite sent')).toBeVisible();
  });

  test('step 3: finish setup', async ({ page }) => {
    await page.goto('/onboarding/step-3');
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## Anti-patterns — Never generate these

| Anti-pattern | Why it's wrong | Alternative |
|---|---|---|
| `retries: 3` in `playwright.config.ts` without a CI guard | Hides real flakiness locally; developers never see genuine failures | `retries: process.env.CI ? 2 : 0` |
| Adding retries as the first response to a flaky test | Treats the symptom, not the cause; the bug persists and can silently worsen | Investigate root cause first (race condition, timing, selector instability), fix it, then add retries if needed |
| Using `test.describe.serial()` because tests share a database record | Creates a fragile chain; one unrelated failure cascades into skipping all remaining tests | Give each test isolated data via `beforeEach` API setup |
| Not calling cleanup inside `testInfo.retry > 0` when tests create server-side state | Retry starts with stale data and fails again for a different reason, making the retry useless | Always clean up residue from previous attempts when `testInfo.retry > 0` |
| Running `--fail-on-flaky-tests` locally during development | Constantly blocks local work on intermittent CI issues | Use `--fail-on-flaky-tests` only in the CI pipeline |

---

## Full Example

```typescript
import { test, expect } from '@playwright/test';

// Stable tests — no special retry config needed
test.describe('product catalog', () => {
  test('lists available products', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('list', { name: 'Products' })).toBeVisible();
  });
});

// Integration with a flaky third-party service — higher retry budget
test.describe('inventory sync (external ERP)', () => {
  test.describe.configure({ retries: 3 });

  test('syncs stock count from ERP within 10 s', async ({ request }) => {
    const res = await request.post('/api/inventory/sync', {
      data: { sku: 'WIDGET-42' },
    });
    expect(res.ok()).toBeTruthy();
    const { stockCount } = await res.json() as { stockCount: number };
    expect(stockCount).toBeGreaterThanOrEqual(0);
  });
});

// Stateful test — clean up before retry
test('places an order successfully', async ({ page, request }, testInfo) => {
  const sessionId = `${testInfo.workerIndex}-${Date.now()}`;

  if (testInfo.retry > 0) {
    const cleanup = await request.delete('/api/orders', { data: { sessionId } });
    expect([200, 404]).toContain(cleanup.status());
    console.log(`Retry ${testInfo.retry}: stale order cleaned up for session ${sessionId}`);
  }

  await page.goto('/shop');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.evaluate((sid) => sessionStorage.setItem('sessionId', sid), sessionId);
  await page.getByLabel('Card number').fill('4111111111111111');
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});

// Ordered wizard — serial is justified
test.describe.serial('account deletion wizard', () => {
  test('step 1: request deletion', async ({ page }) => {
    await page.goto('/settings/delete-account/step-1');
    await page.getByRole('button', { name: 'Request deletion' }).click();
    await expect(page.getByText('Confirmation email sent')).toBeVisible();
  });

  test('step 2: confirm via email link', async ({ page }) => {
    await page.goto('/settings/delete-account/confirm?token=test-token');
    await expect(page.getByText('Account scheduled for deletion')).toBeVisible();
  });

  test('step 3: verify account is inaccessible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
```

---

## Validation Checklist

- [ ] Global `retries` in `playwright.config.ts` is guarded by `process.env.CI`
- [ ] Tests that create server-side resources check `testInfo.retry > 0` and call cleanup before proceeding
- [ ] Per-group `test.describe.configure({ retries: N })` is used only for known external-dependency flakiness
- [ ] `test.describe.serial()` is used only for genuinely ordered flows where each step depends on the previous
- [ ] The CI pipeline uses `--fail-on-flaky-tests` to enforce a zero-flakiness standard
- [ ] All flaky tests have a linked issue or comment explaining the root cause — retries are not the permanent solution
- [ ] `testInfo.retry` value is logged when cleanup is performed so the report shows how many retries occurred
