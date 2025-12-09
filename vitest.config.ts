import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['tests/**/*.test.ts'],
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.json',
      include: ['tests/**/*.test.ts'],
    },
    coverage: {
      include: ['src/**/*.ts'],
    },
    fileParallelism: true,
  },
  plugins: [tsconfigPaths()],
});
