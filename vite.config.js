import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Read from .env so a single variable controls both the proxy and the client
const GAS_BASE = process.env.VITE_GAS_URL ||
  'https://script.google.com/macros/s/AKfycbzUIUfcbiXw6NRtNkUiVG58Xge9Vt2gwwn4vqur0juE3J1RTSjBOMi7c-Bel5Uyjuk/exec';

export default defineConfig({
  plugins: [
    react(),
    gasProxy(),
  ],
})

// Dev-only middleware: forward /api/gas?... to GAS, following Google's redirect
// server-to-server (Node has no CORS restrictions).
function gasProxy() {
  return {
    name: 'gas-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gas', async (req, res) => {
        try {
          const { search } = new URL(req.url, 'http://localhost');
          const upstream = await fetch(GAS_BASE + search, { redirect: 'follow' });
          const body = await upstream.text();
          res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
          res.statusCode = upstream.status;
          res.end(body);
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}
