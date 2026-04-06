import { test as base } from '@playwright/test';
import { ApiClient } from '../api/api-client';

type WorkerFixtures = {
  apiClient: ApiClient;
};

export const test = base.extend<{}, WorkerFixtures>({
  apiClient: [
    async ({ playwright }, use) => {
      const baseURL = process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com';
      const username = process.env.ORANGEHRM_ADMIN_USER ?? 'Admin';
      const password = process.env.ORANGEHRM_ADMIN_PASS ?? 'admin123';

      const context = await playwright.request.newContext({ baseURL });
      const client = new ApiClient(context, baseURL);
      await client.authenticate(username, password);

      await use(client);
      await context.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
