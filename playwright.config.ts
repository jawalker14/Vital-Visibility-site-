import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    channel: 'msedge' // Use system Microsoft Edge
  },
  webServer: [
    {
      command: 'vite build && vite preview --port 5173',
      port: 5173,
      reuseExistingServer: true, // Allow reusing existing server
      timeout: 120000 // Increase timeout for build
    }
  ],
  timeout: 60000, // Increase test timeout
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        channel: 'msedge' // Use system Microsoft Edge
      }
    }
  ]
});
