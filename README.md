# prisma-zero

Generate [Zero](https://zero.rocicorp.dev/) schemas from [Prisma](https://www.prisma.io/) schemas.

## Installation

```bash
npm install prisma-zero
# or
bun add prisma-zero
# or
yarn add prisma-zero
# or
pnpm add prisma-zero
```

## Usage

Add a new generator to your `prisma.schema`:

```prisma
generator zero {
  provider = "prisma-zero"
}
```

Add the schema generation script to your `package.json`:

```json
{
  "scripts": {
    "generate": "prisma generate",
    "postinstall": "npm generate"
  }
}
```

### Use Zero schema file

Use the generated Zero schema:

```tsx
import {useEffect, useState} from 'react';
import {useZero} from '@rocicorp/zero/react';
import {syncedQuery} from '@rocicorp/zero';
import {zql} from '../zero-schema.gen.ts';

const postsQuery = syncedQuery('allPosts', z.tuple([]), () =>
  zql.posts.related('author').limit(10),
);

function PostList() {
  const z = useZero();

  const [posts] = useQuery(postsQuery());

  return (
    <div>
      {posts.map(post => (
        <div key={post.id} className="post">
          {/* Access the JSON content from Drizzle */}
          <p>{post.content.textValue}</p>
          <p>By: {post.author?.name}</p>
          <p>Email: {post.author?.email}</p>
        </div>
      ))}
    </div>
  );
}
```

## Postgres Array Support

Since Zero doesn't natively support Postgres arrays, this generator automatically maps array fields to JSON storage while preserving TypeScript type safety:

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  tags        String[] // Maps to json<string[]>()
  scores      Int[]    // Maps to json<number[]>()
  categories  Category[] // Maps to json<Category[]>() for enum arrays
}

enum Category {
  TECH
  BUSINESS
  LIFESTYLE
}
```

The generated Zero schema will include:

```ts
export const userTable = table('User')
  .columns({
    id: string(),
    email: string(),
    tags: json<string[]>(),
    scores: json<number[]>(),
    categories: json<Category[]>(),
  })
  .primaryKey('id');
```

### Supported Array Types

- **Scalar arrays**: `String[]`, `Int[]`, `Float[]`, `Boolean[]`, `DateTime[]`, `BigInt[]`, `Decimal[]`
- **Enum arrays**: `MyEnum[]`
- **Optional arrays**: `String[]?` → `json<string[]>().optional()`

## Configuration

If you want to customize the behavior of the generator you can use the following options:

```prisma
generator zero {
  // Specify output dir
  output = "generated/zero"
  // When true, the output will be formatted using prettier
  prettier = true
  // When true, the generator will remap table names to camel case using Zero's `.from()` method.
  // You can read more about it here https://zero.rocicorp.dev/docs/zero-schema#name-mapping
  camelCase = true
  // Optional list of Prisma Model names you want to exclude from the generated schema
  // This does *not* change tables that replicate to zero-cache - only the types on the client
  excludeTables = ["Posts", "Comments", ...]
}
```

## Attribution

Thank you to [@elledienne](https://github.com/elledienne) who built [@passionfroot/prisma-generator-zero](https://github.com/Passionfroot/prisma-generator-zero),
which this is heavily based on.
