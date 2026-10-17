import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    // Transpile modern syntax so the app also runs on older Android WebViews
    // (cheap phones that rarely update). Capacitor's minimum is Chrome 60+.
    target: ['es2019', 'chrome70'],
    // Small app: skip the extra compressed-size report to keep builds quick
    reportCompressedSize: false
  }
});
