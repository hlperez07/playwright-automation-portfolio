# Page Object Model — Playwright TypeScript

Implement the Page Object Model (POM) pattern using typed class properties, workflow methods, and fixture-based instantiation.

## Purpose

Define reusable Page Object classes with typed `Locator` properties and workflow methods that encapsulate user interactions, keeping assertions and test logic out of the page layer.

---

## Required Rules

### 1. Declare locators as `readonly Locator` class properties

Locators must be defined as `readonly` properties of type `Locator` on the class, initialised inside the constructor. They are lazy — evaluated at interaction time, not at construction time.

```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('/login');
  }
}
```

### 2. Methods must represent complete user workflows, not single actions

A page object method should model a meaningful user action (e.g. "log in"), not a low-level step (e.g. "click submit button"). Granular one-liner methods defeat the purpose of the abstraction.

```typescript
export class LoginPage {
  // Correct — represents a complete workflow
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  // Correct — navigation is a valid standalone workflow step
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }
}
```

### 3. Instantiate page objects via fixtures, not inside test bodies

Use `test.extend` to inject page objects as typed fixtures. This eliminates boilerplate construction in every test and enables shared setup logic.

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

### 4. Compose page objects — do not duplicate navigation logic

When a workflow spans multiple pages, compose page objects by returning a new page object from a method, or by accepting other page objects as collaborators. Never duplicate navigation logic across classes.

```typescript
export class LoginPage {
  constructor(readonly page: Page, readonly dashboard: DashboardPage) {}

  readonly emailInput: Locator = this.page.getByLabel('Email');
  readonly passwordInput: Locator = this.page.getByLabel('Password');
  readonly submitButton: Locator = this.page.getByRole('button', { name: 'Sign in' });

  async loginAs(email: string, password: string): Promise<DashboardPage> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    return this.dashboard;
  }
}
```

### 5. Never place assertions inside Page Object methods

Assertions (`expect`) belong exclusively in test files. Page object methods must perform actions and optionally return values — never assert on them.

```typescript
// Correct — action only, no assertion
async submitContactForm(name: string, message: string): Promise<void> {
  await this.page.getByLabel('Name').fill(name);
  await this.page.getByLabel('Message').fill(message);
  await this.page.getByRole('button', { name: 'Send' }).click();
}

// The assertion lives in the test file, not here:
// await expect(page.getByRole('alert')).toContainText('Message sent');
```

---

## Anti-patterns — Never generate these

| Anti-pattern | Why it's wrong | Alternative |
|---|---|---|
| Storing locators as plain strings (`readonly emailSelector = 'input[name="email"]'`) | Loses Playwright's `Locator` type, auto-waiting, and chaining capabilities | Declare as `readonly emailInput: Locator = page.getByLabel('Email')` |
| Placing `expect()` calls inside page object methods | Mixes concerns; makes page objects unusable in contexts where the assertion would not hold | Move all assertions to the test file |
| One method per atomic action (`async clickSubmit()`, `async typeEmail()`) | Breaks encapsulation; test code becomes a list of low-level steps | Group related steps into a single workflow method |
| Constructing page objects inline in each test (`const lp = new LoginPage(page)`) | Duplicates construction boilerplate; bypasses fixture lifecycle | Use `test.extend` fixtures |
| Omitting TypeScript types for `Page` and `Locator` | Removes IDE assistance and compile-time safety | Always import and apply `type Page` and `type Locator` from `@playwright/test` |
| Using `page.waitForSelector` inside page object methods | Couples implementation to legacy API; duplicates Playwright's built-in auto-waiting | Remove explicit waits; rely on locator auto-waiting |

---

## Full Example

```typescript
// tests/pages/LoginPage.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/pages/DashboardPage.ts
import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole('heading', { name: /Welcome/ });
  }
}

// tests/fixtures.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

type Fixtures = { loginPage: LoginPage; dashboardPage: DashboardPage };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect };

// tests/specs/login.spec.ts
import { test, expect } from '../fixtures';

test.describe('Login', () => {

  test.describe('when credentials are valid', () => {
    test('should redirect to dashboard after sign in', async ({ loginPage, dashboardPage }) => {
      // Arrange
      await loginPage.goto();

      // Act
      await loginPage.login('user@example.com', 'correct-password');

      // Assert
      await expect(dashboardPage.page).toHaveURL('/dashboard');
      await expect(dashboardPage.welcomeHeading).toBeVisible();
    });
  });

  test.describe('when password is incorrect', () => {
    test('should display an error alert and stay on login page', async ({ loginPage }) => {
      // Arrange
      await loginPage.goto();

      // Act
      await loginPage.login('user@example.com', 'wrong-password');

      // Assert
      await expect(loginPage.errorAlert).toContainText('Invalid credentials');
      await expect(loginPage.page).toHaveURL('/login');
    });
  });

});
```

---

## Validation Checklist

- [ ] All locators are declared as `readonly` properties with the `Locator` type
- [ ] `Page` and `Locator` are imported as types from `@playwright/test`
- [ ] No `expect()` calls appear inside any page object method
- [ ] Each method represents a complete user workflow, not a single element interaction
- [ ] Page objects are instantiated via `test.extend` fixtures, not inside test bodies
- [ ] Page object files contain no test logic or `test()` / `it()` calls
- [ ] No `page.waitForSelector` or `page.waitForTimeout` inside page object methods
- [ ] Composed workflows return the appropriate next page object where relevant
