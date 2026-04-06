import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate as admin user', async ({ page }) => {
  const baseURL = process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com';
  const username = process.env.ORANGEHRM_ADMIN_USER ?? 'Admin';
  const password = process.env.ORANGEHRM_ADMIN_PASS ?? 'admin123';

  await page.goto(`${baseURL}/web/index.php/auth/login`);
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
