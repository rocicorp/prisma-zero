import * as tsup from 'tsup';

const main = async () => {
  await tsup.build({
    outDir: './dist',
    splitting: false,
    entry: ['src/generator.ts'],
    format: ['esm', 'cjs'],
    banner: {
      js: `#!/usr/bin/env node`,
    },
    dts: true,
    target: 'node16',
    platform: 'node',
    external: [
      'esbuild',
      'tsx',
      'prettier',
      'typescript',
      '@rocicorp/zero',
      'prisma',
    ],
  });
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
