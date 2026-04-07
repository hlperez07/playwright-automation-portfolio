import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 2 workers in CI to avoid saturating the shared OrangeHRM demo under parallel load.
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    // OrangeHRM demo responds slower from CI runners — give assertions more headroom.
    timeout: process.env.CI ? 15_000 : 10_000,
  },
  outputDir: 'test-results',
  reporter: process.env.CI
    ? [['line'], ['allure-playwright', { resultsDir: 'allure-results' }]]
    : [['line'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com',
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
  ],
});
