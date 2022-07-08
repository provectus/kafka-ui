import { defineConfig, loadEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const defaultConfig: UserConfigExport = {
    plugins: [react(), tsconfigPaths()],
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            venod: [
              'react',
              'react-router-dom',
              'react-dom',
              'redux',
              'redux-thunk',
              'react-redux',
              'styled-components',
              'react-ace',
            ],
          },
        },
      },
    },
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      'process.env.VITE_TAG': `"${process.env.VITE_TAG}"`,
      'process.env.GIT_COMMIT': `"${process.env.VITE_COMMIT}"`,
    },
  };
  const proxy = process.env.VITE_DEV_PROXY;

  if (mode === 'development' && proxy) {
    return {
      ...defaultConfig,
      server: {
        open: true,
        proxy: {
          '/api': {
            target: proxy,
            changeOrigin: true,
            secure: false,
          },
        },
      },
    };
  }

  return defaultConfig;
});
