import {defineConfig} from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: 'postgresql://postgres:postgres@localhost:5432/prisma-zero',
  },
});
