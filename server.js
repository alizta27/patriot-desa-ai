const http = require('http');
const httpProxy = require('http-proxy');

// Try ports in order: 8080, 8081, 8082
const VITE_PORTS = [8080, 8081, 8082];
let vitePort = 8080;

async function findVitePort() {
  for (const port of VITE_PORTS) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) {
        vitePort = port;
        console.log(`Found Vite running on port ${port}`);
        return;
      }
    } catch (e) {
      // Port not responding, try next
    }
  }
  console.log(`Vite not found, defaulting to port ${VITE_PORTS[0]}`);
}

findVitePort().then(() => {
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${vitePort}`,
    ws: true,
    changeOrigin: true
  });

  const server = http.createServer((req, res) => {
    proxy.web(req, res);
  });

  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
  });

  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (res.writeHead) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error - Is Vite running?');
    }
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Proxy server running on port ${PORT}`);
    console.log(`✓ Forwarding to Vite on port ${vitePort}`);
    console.log(`✓ App accessible at http://localhost:${PORT}`);
  });
});
