// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  if (process.env.DEV_PROXY) {
    app.use(
      '/api',
      createProxyMiddleware({
        target: process.env.DEV_PROXY,
        changeOrigin: true,
        secure: false,
      })
    );
  }
};
