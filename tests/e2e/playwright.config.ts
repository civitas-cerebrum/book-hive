import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  reporter: 'html',
  timeout: 60000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:7547',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
