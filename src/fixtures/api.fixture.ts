import { test as base } from '@playwright/test';
import { ApiClient } from '../api/api-client';

type WorkerFixtures = {
  apiClient: ApiClient;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const test = base.extend<{}, WorkerFixtures>({
  apiClient: [
    async ({ playwright }, use) => {
      const baseURL = process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com';
      const username = process.env.ORANGEHRM_ADMIN_USER ?? 'Admin';
      const password = process.env.ORANGEHRM_ADMIN_PASS ?? 'admin123';

      // Pass an explicit empty storageState so the request context starts with no
      // cookies — without this, E2E workers inherit the browser context's
      // storageState (the authenticated 'orangehrm' session cookie), causing
      // GET /auth/login to redirect to /dashboard instead of returning the login page.
      const context = await playwright.request.newContext({
        baseURL,
        storageState: { cookies: [], origins: [] },
      });
      const client = new ApiClient(context, baseURL);
      await client.authenticate(username, password);

      await use(client);
      await context.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
