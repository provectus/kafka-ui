import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  use: {
    headless: true,
    baseURL:'http://localhost:8080/',
    screenshot:'only-on-failure',
  },
  testDir:'../tests',
  testMatch:'tests/**/*.ts'
};
export default config;