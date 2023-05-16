import type { Config } from '@jest/types';

export default {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/generated-sources/',
    '<rootDir>/src/lib/fixtures/',
    '<rootDir>/vite.config.ts',
    '<rootDir>/src/index.tsx',
    '<rootDir>/src/serviceWorker.ts',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  resolver: '<rootDir>/.jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__{test,tests}__/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': '@swc/jest',
    '^.+\\.css$': '<rootDir>/.jest/cssTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: ['<rootDir>/src'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
  reporters: ['default', 'github-actions'],
} as Config.InitialOptions;
