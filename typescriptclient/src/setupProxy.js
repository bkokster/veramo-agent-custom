const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {

  const PORT = process.env.PORT || 3001;
  const baseHost = 'http://localhost:'
  targetProxy = baseHost.concat(PORT);

  app.use(
    '/api',
    createProxyMiddleware({
      target: targetProxy,
      changeOrigin: true,
    })
  );

};