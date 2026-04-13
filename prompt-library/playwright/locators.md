# Playwright Locators — Semantic Priority

Generate Playwright locator code that prioritizes accessibility-based and user-visible locators over CSS/XPath selectors, applies correct filtering and chaining patterns, and handles strictness errors by narrowing rather than blindly indexing.

---

## Required Rules

### 1. Follow the 7 recommended locators in priority order

Always prefer locators higher in this list. Move down only when the element genuinely cannot be identified by a higher-priority strategy.

1. `getByRole()` — ARIA role + accessible name (preferred for interactive elements)
2. `getByText()` — visible text content (preferred for static text nodes)
3. `getByLabel()` — input associated with a `<label>` (preferred for form fields)
4. `getByPlaceholder()` — input placeholder text (fallback for unlabeled inputs)
5. `getByAltText()` — image alt text (for `<img>` elements)
6. `getByTitle()` — element title attribute (for tooltip-bearing elements)
7. `getByTestId()` — `data-testid` attribute (last resort — for elements with no other stable identity)

```typescript
import { test, expect } from '@playwright/test';

test('locator priority demonstration', async ({ page }) => {
  await page.goto('/form');

  // 1. Interactive element by ARIA role + accessible name
  const submitButton = page.getByRole('button', { name: 'Submit' });

  // 3. Form input by associated label
  const emailField = page.getByLabel('Email address');

  // 5. Image by alt text
  const logo = page.getByAltText('Company logo');

  // 7. Element with no accessible identity — last resort
  const widget = page.getByTestId('price-widget');
});
```

### 2. Use `getByRole()` with the correct ARIA role and `name` option

`getByRole()` is the most resilient locator because it matches what assistive technologies expose. Always pass `name` to disambiguate when multiple elements share the same role.

```typescript
page.getByRole('button', { name: 'Sign in' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Remember me' })
page.getByRole('navigation', { name: 'Main menu' })
page.getByRole('heading', { name: 'Dashboard', level: 1 })
page.getByRole('link', { name: 'View details' })
```

### 3. Use `locator.filter()` to narrow — not bare index

When a locator matches multiple elements, use `.filter({ hasText })` or `.filter({ has })` to narrow to the intended match. This is more stable than `.nth(0)` alone because it anchors to content, not DOM order.

```typescript
// Wrong — positional, breaks if DOM order changes
page.getByRole('listitem').nth(0)

// Correct — filter by visible content first
page.getByRole('listitem').filter({ hasText: 'Product A' })

// Filter by a child locator
page.getByRole('article').filter({
  has: page.getByRole('img', { name: 'Featured' }),
})

// Combine filter with nth only when order within a filtered set matters
page.getByRole('row').filter({ hasText: 'Active' }).nth(1)
```

### 4. Chain locators to scope searches to a container

Calling a locator method on another locator restricts the search to the subtree of the parent. This is the correct way to handle repeated UI patterns like rows, cards, and list items.

```typescript
// Scope a button search inside a specific card
const productCard = page.getByRole('article').filter({ hasText: 'Widget Pro' });
await productCard.getByRole('button', { name: 'Add to cart' }).click();

// Scope form fields inside a dialog
const dialog = page.getByRole('dialog', { name: 'Edit address' });
await dialog.getByLabel('Street').fill('123 Main St');
await dialog.getByLabel('City').fill('Springfield');
await dialog.getByRole('button', { name: 'Save' }).click();
```

### 5. Handle strictness by narrowing — never suppress it

Playwright throws when more than one element matches (strict mode). Resolve it by filtering or chaining, not by calling `.first()` blindly.

```typescript
// Playwright throws: "strict mode violation — locator resolved to N elements"

// Wrong fix — suppresses the error without fixing the locator
page.getByRole('button', { name: 'Edit' }).first()

// Correct fix — scope to the relevant container
page.getByRole('row').filter({ hasText: 'Alice Johnson' })
  .getByRole('button', { name: 'Edit' })

// Correct fix — add exact matching to reduce ambiguity
page.getByRole('button', { name: 'Edit profile', exact: true })
```

### 6. Use `getByText()` with `exact` option deliberately

By default `getByText('Save')` matches any element whose text contains "Save" (substring). Pass `{ exact: true }` when you need a full-string match.

```typescript
// Matches any element containing "Save"
page.getByText('Save')

// Matches only elements whose full text is exactly "Save"
page.getByText('Save', { exact: true })

// Case-insensitive substring via regex
page.getByText(/save/i)
```

---

## Anti-patterns — Never generate these

| Anti-pattern | Why it's wrong | Alternative |
|---|---|---|
| `page.locator('div > span.submit-btn')` when `getByRole` works | CSS selectors break when class names or markup change | `page.getByRole('button', { name: 'Submit' })` |
| `page.locator('#email-input')` when a label is present | IDs can change or be duplicated in SPAs | `page.getByLabel('Email')` |
| `page.locator('//div[@class="btn"]')` as first choice | XPath is brittle and does not pierce Shadow DOM | Use semantic locators first; CSS before XPath |
| `page.getByRole('button').nth(0)` without `.filter()` | Breaks if a new element is inserted before the target | Narrow with `.filter({ hasText: '...' })` first |
| `page.locator('[data-testid]')` without a specific value | Matches every element that has any data-testid | `page.getByTestId('submit-button')` |
| CSS pseudo-selectors like `:visible` or `:enabled` in `page.locator()` | Playwright-specific extensions slated for removal | Use assertions (`toBeVisible`, `toBeEnabled`) or actionability auto-waiting |

---

## Full Example

```typescript
import { test, expect } from '@playwright/test';

test('user finds a product and adds it to the cart', async ({ page }) => {
  await page.goto('/products');

  // getByRole — heading
  await expect(page.getByRole('heading', { name: 'All Products', level: 1 })).toBeVisible();

  // getByLabel — search input
  await page.getByLabel('Search products').fill('Wireless Keyboard');
  await page.getByRole('button', { name: 'Search' }).click();

  // Chaining: scope to a specific product card
  const keyboardCard = page.getByRole('article').filter({ hasText: 'Wireless Keyboard' });
  await expect(keyboardCard).toBeVisible();

  // getByAltText — product image
  await expect(keyboardCard.getByAltText('Wireless Keyboard product photo')).toBeVisible();

  // getByRole scoped to the card
  await keyboardCard.getByRole('button', { name: 'Add to cart' }).click();

  // getByTestId — last resort for cart badge
  await expect(page.getByTestId('cart-item-count')).toHaveText('1');
});

test('user edits the correct row in a data table', async ({ page }) => {
  await page.goto('/admin/users');

  // Narrow by row content — avoids strict mode violation
  const targetRow = page.getByRole('row').filter({ hasText: 'alice@example.com' });
  await targetRow.getByRole('button', { name: 'Edit' }).click();

  // Dialog scoping — all interactions stay inside
  const editDialog = page.getByRole('dialog', { name: 'Edit user' });
  await expect(editDialog).toBeVisible();

  await editDialog.getByLabel('Display name').clear();
  await editDialog.getByLabel('Display name').fill('Alice Johnson');
  await editDialog.getByRole('button', { name: 'Save changes' }).click();

  await expect(targetRow.getByRole('cell', { name: 'Alice Johnson' })).toBeVisible();
});
```

---

## Validation Checklist

- [ ] `getByRole()` is used for all interactive elements where an accessible name is available
- [ ] `getByLabel()` is used for form inputs that have an associated `<label>` element
- [ ] CSS selectors are only used when no semantic locator can identify the element
- [ ] XPath selectors are absent unless documented as the only option
- [ ] Strict mode violations are resolved by `.filter()` or chaining, not `.first()` alone
- [ ] `getByText()` uses `{ exact: true }` when a full-string match is required
- [ ] Locator chaining is used when targeting elements inside repeated containers (cards, rows, dialogs)
- [ ] `getByTestId()` is reserved for elements with no accessible name or visible text
- [ ] `.nth()` is only used after `.filter()` has already narrowed the set
