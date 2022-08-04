import {
  defineConfig,
  loadEnv,
  UserConfigExport,
  splitVendorChunkPlugin,
} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const defaultConfig: UserConfigExport = {
    plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin()],
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
    },
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      'process.env.VITE_TAG': `"${process.env.VITE_TAG}"`,
      'process.env.VITE_COMMIT': `"${process.env.VITE_COMMIT}"`,
    },
  };
  const proxy = process.env.VITE_DEV_PROXY;

  if (mode === 'development' && proxy) {
    return {
      ...defaultConfig,
      server: {
        ...defaultConfig.server,
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
