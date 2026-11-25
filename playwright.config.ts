import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    baseURL: 'http://localhost:8788',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:8788',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
