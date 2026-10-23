import { defineConfig } from "vitest/config"

export default defineConfig({
 test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/routes/index.ts', '**/utils/jwt.util.ts', '**/server.ts', '**/app.ts']
    }
  }
})