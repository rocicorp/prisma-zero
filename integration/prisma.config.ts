import {defineConfig} from 'prisma/config';

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/prisma-zero';

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
