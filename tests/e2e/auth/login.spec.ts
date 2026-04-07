import { test, expect } from '@playwright/test';

const BASE_URL =
  process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com';
const LOGIN_URL = `${BASE_URL}/web/index.php/auth/login`;

test.describe('Login', () => {
  // The e2e project loads storageState (authenticated session) at context level.
  // Override it here so these tests always start unauthenticated.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test('should redirect to dashboard after valid login', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should display error for invalid password', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should display error for invalid username', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('nonexistentuser99999');
    await page.getByPlaceholder('Password').fill('anypassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should display validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Required').first()).toBeVisible();
  });

  test('should redirect to login page after logout', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // The user profile dropdown is rendered as <a role="button"> in the top banner.
    // We cannot rely on the display name ('Admin') because the shared demo may
    // rename the Admin account. Use the structural CSS class as a last resort.
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
