import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  plugins: [tsconfigPaths()],
});
