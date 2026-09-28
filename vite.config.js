import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Only used for the dev-proxy fallback below. When VITE_API_BASE_URL is set
  // the app calls the backend directly and the proxy is never hit.
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'http://localhost:8080';

  const proxy = {
    // Backend REST (Spring Boot). Sessions/JWT cookie flow through the proxy
    // so the browser sees one origin — no CORS or SameSite problems.
    '/api': {
      target,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    // SockJS + WebSocket transport (HTTP polling + ws upgrade)
    '/ws': {
      target,
      ws: true,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    // sockjs-client runs in the browser but expects Node's `global` object.
    // Map it to globalThis in BOTH source transforms and the dependency
    // optimizer — without the optimizeDeps form, pre-bundled deps like
    // sockjs-client still crash with "global is not defined" (white screen).
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      port: 5173,
      proxy,
    },
    // Keep `vite preview` behaving like dev when VITE_API_BASE_URL is empty.
    preview: {
      port: 4173,
      proxy,
    },
  };
});
