import { PlaywrightTestConfig } from '@playwright/test';

/// <reference types="node" />

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 30000,
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'API Tests',
      testMatch: /.*\.spec\.ts/,
    }
  ],
};

export default config; 