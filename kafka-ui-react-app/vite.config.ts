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
            lodash: ['lodash'],
          },
        },
      },
    },
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
    },
  };

  if (mode === 'development' && process.env.VITE_DEV_PROXY) {
    return {
      ...defaultConfig,
      server: {
        open: true,
        proxy: {
          '/api': {
            target: process.env.VITE_DEV_PROXY,
            changeOrigin: true,
            secure: false,
          },
        },
      },
    };
  }

  return defaultConfig;
});
