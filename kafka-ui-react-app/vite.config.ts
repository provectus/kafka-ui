import {
  defineConfig,
  loadEnv,
  UserConfigExport,
  splitVendorChunkPlugin,
} from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const defaultConfig: UserConfigExport = {
    plugins: [
      react(),
      tsconfigPaths(),
      splitVendorChunkPlugin(),
      ViteEjsPlugin({
        PUBLIC_PATH: mode !== 'development' ? 'PUBLIC-PATH-VARIABLE' : '',
      }),
    ],
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            ace: ['ace-builds', 'react-ace'],
          },
        },
      },
    },
    experimental: {
      renderBuiltUrl(
        filename: string,
        {
          hostType,
        }: {
          hostId: string;
          hostType: 'js' | 'css' | 'html';
          type: 'asset' | 'public';
        }
      ) {
        if (hostType === 'js') {
          return {
            runtime: `window.__assetsPathBuilder(${JSON.stringify(filename)})`,
          };
        }

        return filename;
      },
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
          '/actuator/info': {
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
