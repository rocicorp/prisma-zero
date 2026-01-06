import {describe, expect, it} from 'vitest';
import {transformSchema} from '../src/mappers/schema-mapper';
import type {Config} from '../src/types';
import {createEnum, createField, createMockDMMF, createModel} from './utils';

describe('Schema Mapper', () => {
  const baseConfig: Config = {
    name: 'test',
    prettier: false,
    resolvePrettierConfig: false,
    camelCase: false,
  };

  describe('scalar types', () => {
    it('should map all basic Prisma scalar types correctly', () => {
      const model = createModel('ScalarTypes', [
        createField('id', 'String', {isId: true}),
        createField('str', 'String'),
        createField('int', 'Int'),
        createField('float', 'Float'),
        createField('bool', 'Boolean'),
        createField('dateTime', 'DateTime'),
        createField('json', 'Json'),
        createField('bigInt', 'BigInt'),
        createField('decimal', 'Decimal'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const scalarModel = result.models[0];
      expect(scalarModel?.columns?.id?.type).toBe('string()');
      expect(scalarModel?.columns?.str?.type).toBe('string()');
      expect(scalarModel?.columns?.int?.type).toBe('number()');
      expect(scalarModel?.columns?.float?.type).toBe('number()');
      expect(scalarModel?.columns?.bool?.type).toBe('boolean()');
      expect(scalarModel?.columns?.dateTime?.type).toBe('number()');
      expect(scalarModel?.columns?.json?.type).toBe('json()');
      expect(scalarModel?.columns?.bigInt?.type).toBe('number()');
      expect(scalarModel?.columns?.decimal?.type).toBe('number()');
    });

    it('should exclude Bytes fields from the schema (unsupported)', () => {
      const model = createModel('BytesModel', [
        createField('id', 'String', {isId: true}),
        createField('data', 'Bytes'),
        createField('name', 'String'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const bytesModel = result.models[0];
      expect(bytesModel?.columns).toHaveProperty('id');
      expect(bytesModel?.columns).toHaveProperty('name');
      expect(bytesModel?.columns).not.toHaveProperty('data');
    });

    it('should handle optional scalar types correctly', () => {
      const model = createModel('OptionalTypes', [
        createField('id', 'String', {isId: true}),
        createField('str', 'String', {isRequired: false}),
        createField('int', 'Int', {isRequired: false}),
        createField('float', 'Float', {isRequired: false}),
        createField('bool', 'Boolean', {isRequired: false}),
        createField('dateTime', 'DateTime', {isRequired: false}),
        createField('json', 'Json', {isRequired: false}),
        createField('bigInt', 'BigInt', {isRequired: false}),
        createField('decimal', 'Decimal', {isRequired: false}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const optionalModel = result.models[0];
      expect(optionalModel?.columns?.str?.isOptional).toBe(true);
      expect(optionalModel?.columns?.int?.isOptional).toBe(true);
      expect(optionalModel?.columns?.float?.isOptional).toBe(true);
      expect(optionalModel?.columns?.bool?.isOptional).toBe(true);
      expect(optionalModel?.columns?.dateTime?.isOptional).toBe(true);
      expect(optionalModel?.columns?.json?.isOptional).toBe(true);
      expect(optionalModel?.columns?.bigInt?.isOptional).toBe(true);
      expect(optionalModel?.columns?.decimal?.isOptional).toBe(true);
    });
  });

  describe('array types', () => {
    it('should map all scalar array types to json with type annotations', () => {
      const model = createModel('ArrayTypes', [
        createField('id', 'String', {isId: true}),
        createField('strings', 'String', {isList: true}),
        createField('ints', 'Int', {isList: true}),
        createField('floats', 'Float', {isList: true}),
        createField('bools', 'Boolean', {isList: true}),
        createField('dateTimes', 'DateTime', {isList: true}),
        createField('jsons', 'Json', {isList: true}),
        createField('bigInts', 'BigInt', {isList: true}),
        createField('decimals', 'Decimal', {isList: true}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const arrayModel = result.models[0];
      expect(arrayModel?.columns?.strings?.type).toBe('json<string[]>()');
      expect(arrayModel?.columns?.ints?.type).toBe('json<number[]>()');
      expect(arrayModel?.columns?.floats?.type).toBe('json<number[]>()');
      expect(arrayModel?.columns?.bools?.type).toBe('json<boolean[]>()');
      expect(arrayModel?.columns?.dateTimes?.type).toBe('json<number[]>()');
      expect(arrayModel?.columns?.jsons?.type).toBe('json<any[]>()');
      expect(arrayModel?.columns?.bigInts?.type).toBe('json<number[]>()');
      expect(arrayModel?.columns?.decimals?.type).toBe('json<number[]>()');
    });

    it('should handle optional array types', () => {
      const model = createModel('OptionalArrays', [
        createField('id', 'String', {isId: true}),
        createField('tags', 'String', {isList: true, isRequired: false}),
        createField('scores', 'Int', {isList: true, isRequired: false}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const optArrayModel = result.models[0];
      expect(optArrayModel?.columns?.tags?.type).toBe('json<string[]>()');
      expect(optArrayModel?.columns?.tags?.isOptional).toBe(true);
      expect(optArrayModel?.columns?.scores?.type).toBe('json<number[]>()');
      expect(optArrayModel?.columns?.scores?.isOptional).toBe(true);
    });

    it('should exclude Bytes[] from the schema (unsupported)', () => {
      const model = createModel('BytesArrayModel', [
        createField('id', 'String', {isId: true}),
        createField('data', 'Bytes', {isList: true}),
        createField('name', 'String'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const bytesArrayModel = result.models[0];
      expect(bytesArrayModel?.columns).toHaveProperty('id');
      expect(bytesArrayModel?.columns).toHaveProperty('name');
      expect(bytesArrayModel?.columns).not.toHaveProperty('data');
    });
  });

  describe('enum types', () => {
    it('should map enum fields correctly', () => {
      const model = createModel('EnumModel', [
        createField('id', 'String', {isId: true}),
        createField('role', 'Role', {kind: 'enum'}),
      ]);
      const roleEnum = createEnum('Role', ['USER', 'ADMIN']);

      const dmmf = createMockDMMF([model], [roleEnum]);
      const result = transformSchema(dmmf, baseConfig);

      const enumModel = result.models[0];
      expect(enumModel?.columns?.role?.type).toBe('enumeration<Role>()');
    });

    it('should map optional enum fields correctly', () => {
      const model = createModel('OptionalEnumModel', [
        createField('id', 'String', {isId: true}),
        createField('status', 'Status', {kind: 'enum', isRequired: false}),
      ]);
      const statusEnum = createEnum('Status', ['ACTIVE', 'INACTIVE']);

      const dmmf = createMockDMMF([model], [statusEnum]);
      const result = transformSchema(dmmf, baseConfig);

      const enumModel = result.models[0];
      expect(enumModel?.columns?.status?.type).toBe('enumeration<Status>()');
      expect(enumModel?.columns?.status?.isOptional).toBe(true);
    });

    it('should map enum array fields to json', () => {
      const model = createModel('EnumArrayModel', [
        createField('id', 'String', {isId: true}),
        createField('roles', 'Role', {kind: 'enum', isList: true}),
      ]);
      const roleEnum = createEnum('Role', ['USER', 'ADMIN', 'MODERATOR']);

      const dmmf = createMockDMMF([model], [roleEnum]);
      const result = transformSchema(dmmf, baseConfig);

      const enumArrayModel = result.models[0];
      expect(enumArrayModel?.columns?.roles?.type).toBe('json<Role[]>()');
    });

    it('should include enums in the result with correct values', () => {
      const model = createModel('EnumModel', [
        createField('id', 'String', {isId: true}),
        createField('role', 'Role', {kind: 'enum'}),
      ]);
      const roleEnum = createEnum('Role', ['USER', 'ADMIN']);

      const dmmf = createMockDMMF([model], [roleEnum]);
      const result = transformSchema(dmmf, baseConfig);

      expect(result.enums).toHaveLength(1);
      expect(result.enums[0]?.name).toBe('Role');
      expect(result.enums[0]?.values).toEqual([
        {name: 'USER', dbName: null},
        {name: 'ADMIN', dbName: null},
      ]);
    });

    it('should handle enums with @map attributes', () => {
      const model = createModel('MappedEnumModel', [
        createField('id', 'String', {isId: true}),
        createField('status', 'Status', {kind: 'enum'}),
      ]);
      // Simulate enum with mapped values
      const statusEnum = {
        name: 'Status',
        dbName: null,
        values: [
          {name: 'ACTIVE', dbName: 'active'},
          {name: 'INACTIVE', dbName: 'inactive'},
        ],
      };

      const dmmf = createMockDMMF([model], [statusEnum]);
      const result = transformSchema(dmmf, baseConfig);

      expect(result.enums).toHaveLength(1);
      expect(result.enums[0]?.values).toEqual([
        {name: 'ACTIVE', dbName: 'active'},
        {name: 'INACTIVE', dbName: 'inactive'},
      ]);
    });

    it('should handle multiple enums', () => {
      const model = createModel('MultiEnumModel', [
        createField('id', 'String', {isId: true}),
        createField('role', 'Role', {kind: 'enum'}),
        createField('status', 'Status', {kind: 'enum'}),
        createField('priority', 'Priority', {kind: 'enum'}),
      ]);
      const roleEnum = createEnum('Role', ['USER', 'ADMIN']);
      const statusEnum = createEnum('Status', ['ACTIVE', 'INACTIVE', 'PENDING']);
      const priorityEnum = createEnum('Priority', ['LOW', 'MEDIUM', 'HIGH']);

      const dmmf = createMockDMMF([model], [roleEnum, statusEnum, priorityEnum]);
      const result = transformSchema(dmmf, baseConfig);

      expect(result.enums).toHaveLength(3);
      expect(result.enums.map(e => e.name).sort()).toEqual([
        'Priority',
        'Role',
        'Status',
      ]);
    });
  });

  describe('native database types', () => {
    it('should map PostgreSQL native types to their base Zero types', () => {
      const model = createModel('PostgresNativeTypes', [
        createField('id', 'String', {isId: true}),
        // String native types
        createField('text', 'String'),
        createField('varchar', 'String'),
        createField('char', 'String'),
        createField('uuid', 'String'),
        createField('xml', 'String'),
        createField('inet', 'String'),
        // Int native types
        createField('integer', 'Int'),
        createField('smallint', 'Int'),
        // BigInt native types
        createField('bigint', 'BigInt'),
        // Float native types
        createField('doublePrecision', 'Float'),
        createField('real', 'Float'),
        // Decimal native types
        createField('decimal', 'Decimal'),
        createField('money', 'Decimal'),
        // DateTime native types
        createField('timestamp', 'DateTime'),
        createField('timestamptz', 'DateTime'),
        createField('date', 'DateTime'),
        createField('time', 'DateTime'),
        // Json native types
        createField('json', 'Json'),
        createField('jsonb', 'Json'),
        // Boolean native types
        createField('boolean', 'Boolean'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const nativeModel = result.models[0];
      // All String native types map to string()
      expect(nativeModel?.columns?.text?.type).toBe('string()');
      expect(nativeModel?.columns?.varchar?.type).toBe('string()');
      expect(nativeModel?.columns?.char?.type).toBe('string()');
      expect(nativeModel?.columns?.uuid?.type).toBe('string()');
      expect(nativeModel?.columns?.xml?.type).toBe('string()');
      expect(nativeModel?.columns?.inet?.type).toBe('string()');
      // All Int native types map to number()
      expect(nativeModel?.columns?.integer?.type).toBe('number()');
      expect(nativeModel?.columns?.smallint?.type).toBe('number()');
      // All BigInt native types map to number()
      expect(nativeModel?.columns?.bigint?.type).toBe('number()');
      // All Float native types map to number()
      expect(nativeModel?.columns?.doublePrecision?.type).toBe('number()');
      expect(nativeModel?.columns?.real?.type).toBe('number()');
      // All Decimal native types map to number()
      expect(nativeModel?.columns?.decimal?.type).toBe('number()');
      expect(nativeModel?.columns?.money?.type).toBe('number()');
      // All DateTime native types map to number()
      expect(nativeModel?.columns?.timestamp?.type).toBe('number()');
      expect(nativeModel?.columns?.timestamptz?.type).toBe('number()');
      expect(nativeModel?.columns?.date?.type).toBe('number()');
      expect(nativeModel?.columns?.time?.type).toBe('number()');
      // All Json native types map to json()
      expect(nativeModel?.columns?.json?.type).toBe('json()');
      expect(nativeModel?.columns?.jsonb?.type).toBe('json()');
      // Boolean native types map to boolean()
      expect(nativeModel?.columns?.boolean?.type).toBe('boolean()');
    });

  });

  describe('@updatedAt attribute', () => {
    it('should include fields with @updatedAt attribute', () => {
      const model = createModel('TimestampModel', [
        createField('id', 'String', {isId: true}),
        createField('createdAt', 'DateTime'),
        createField('updatedAt', 'DateTime', {isUpdatedAt: true}),
        createField('name', 'String'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const timestampModel = result.models[0];
      expect(timestampModel?.columns?.createdAt?.type).toBe('number()');
      expect(timestampModel?.columns?.updatedAt?.type).toBe('number()');
    });
  });

  describe('@default attribute handling', () => {
    it('should include fields with various @default values', () => {
      const model = createModel('DefaultsModel', [
        createField('id', 'String', {isId: true, hasDefaultValue: true}),
        createField('createdAt', 'DateTime', {hasDefaultValue: true}),
        createField('isActive', 'Boolean', {hasDefaultValue: true}),
        createField('count', 'Int', {hasDefaultValue: true}),
        createField('name', 'String', {hasDefaultValue: true}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const defaultsModel = result.models[0];
      expect(defaultsModel?.columns?.id?.type).toBe('string()');
      expect(defaultsModel?.columns?.createdAt?.type).toBe('number()');
      expect(defaultsModel?.columns?.isActive?.type).toBe('boolean()');
      expect(defaultsModel?.columns?.count?.type).toBe('number()');
      expect(defaultsModel?.columns?.name?.type).toBe('string()');
    });
  });

  describe('excludeTables', () => {
    it('should exclude specified tables from the schema', () => {
      const models = [
        createModel('User', [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
        ]),
        createModel('Post', [
          createField('id', 'String', {isId: true}),
          createField('title', 'String'),
        ]),
        createModel('Comment', [
          createField('id', 'String', {isId: true}),
          createField('content', 'String'),
        ]),
      ];

      const dmmf = createMockDMMF(models);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        excludeTables: ['Post', 'Comment'],
      });

      expect(result.models).toHaveLength(1);
      expect(result.models[0]?.tableName).toBe('User');
    });

    it('should exclude many-to-many relationships involving excluded tables', () => {
      const models = [
        createModel('User', [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
          createField('posts', 'Post', {
            isList: true,
            relationName: 'UserPosts',
          }),
        ]),
        createModel('Post', [
          createField('id', 'String', {isId: true}),
          createField('title', 'String'),
          createField('users', 'User', {
            isList: true,
            relationName: 'UserPosts',
          }),
        ]),
      ];

      const dmmf = createMockDMMF(models);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        excludeTables: ['Post'],
      });

      expect(result.models).toHaveLength(1);
      expect(result.models[0]?.tableName).toBe('User');
      // The implicit many-to-many join table should not be included
      expect(
        result.models.find(m => m.tableName === '_UserPosts'),
      ).toBeUndefined();
    });

    it('should exclude relationship fields from excluded tables', () => {
      const models = [
        createModel('User', [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
          createField('profile', 'Profile', {relationName: 'UserProfile'}),
          createField('posts', 'Post', {relationName: 'UserPosts'}),
        ]),
        createModel('Post', [
          createField('id', 'String', {isId: true}),
          createField('title', 'String'),
          createField('users', 'User', {
            isList: true,
            relationName: 'UserPosts',
          }),
        ]),
        createModel('Profile', [
          createField('id', 'String', {isId: true}),
          createField('bio', 'String'),
          createField('user', 'User', {relationName: 'UserProfile'}),
        ]),
      ];

      const dmmf = createMockDMMF(models);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        excludeTables: ['Post'],
      });

      const userModel = result.models.find(m => m.tableName === 'User');
      expect(userModel).toBeDefined();
      if (userModel) {
        // Verify that the posts relationship field is not included
        expect(userModel.relationships).not.toHaveProperty('posts');
        // Verify that the profile relationship field is still included
        expect(userModel.relationships).toHaveProperty('profile');
      }
    });
  });

  describe('camelCase', () => {
    it('should not remap table names when camelCase is false', () => {
      const model = createModel('UserProfile', [
        createField('id', 'String', {isId: true}),
        createField('name', 'String'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      expect(result.models[0]?.tableName).toBe('UserProfile');
      expect(result.models[0]?.originalTableName).toBeNull();
    });

    it('keeps Prisma model names when @@map is used and camelCase is false', () => {
      const model = createModel(
        'TableMapping',
        [createField('id', 'String', {isId: true})],
        {dbName: 'table_mappings'},
      );

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      expect(result.models[0]?.tableName).toBe('TableMapping');
      expect(result.models[0]?.originalTableName).toBe('table_mappings');
    });

    it('should remap table names to camel case when camelCase is true', () => {
      const model = createModel('UserProfile', [
        createField('id', 'String', {isId: true}),
        createField('name', 'String'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      expect(result.models[0]?.tableName).toBe('userProfile');
      expect(result.models[0]?.originalTableName).toBe('UserProfile');
    });

    it('camelCases the Prisma model name but preserves @@map database name', () => {
      const model = createModel(
        'TableMapping',
        [createField('id', 'String', {isId: true})],
        {dbName: 'table_mappings'},
      );

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      expect(result.models[0]?.tableName).toBe('tableMapping');
      expect(result.models[0]?.originalTableName).toBe('table_mappings');
    });

    it('should preserve table name if already in camel case', () => {
      const model = createModel('userProfile', [
        createField('id', 'String', {isId: true}),
        createField('name', 'String'),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      expect(result.models[0]?.tableName).toBe('userProfile');
      expect(result.models[0]?.originalTableName).toBeNull();
    });

    it('should handle table names with underscores', () => {
      const model = createModel(
        'User',
        [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
        ],
        {
          dbName: 'user_profile',
        },
      );

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      expect(result.models[0]?.tableName).toBe('user');
      expect(result.models[0]?.originalTableName).toBe('user_profile');
    });

    it('should handle table names with multiple underscores', () => {
      const model = createModel(
        'User',
        [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
        ],
        {
          dbName: 'user_profile_settings',
        },
      );

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      expect(result.models[0]?.tableName).toBe('user');
      expect(result.models[0]?.originalTableName).toBe('user_profile_settings');
    });

    it('should preserve leading underscores', () => {
      const model = createModel(
        'UserProfile',
        [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
        ],
        {
          dbName: '_UserProfile',
        },
      );

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      expect(result.models[0]?.tableName).toBe('userProfile');
      expect(result.models[0]?.originalTableName).toBe('_UserProfile');
    });

    it('should handle implicit many-to-many join tables', () => {
      const postModel = createModel('Post', [
        createField('id', 'String', {isId: true}),
        createField('categories', 'Category', {
          isList: true,
          relationName: 'PostToCategory',
          kind: 'object',
        }),
      ]);

      const categoryModel = createModel('Category', [
        createField('id', 'String', {isId: true}),
        createField('posts', 'Post', {
          isList: true,
          relationName: 'PostToCategory',
          kind: 'object',
        }),
      ]);

      const dmmf = createMockDMMF([postModel, categoryModel]);
      const result = transformSchema(dmmf, {
        ...baseConfig,
        camelCase: true,
      });

      // Find the join table (note: the join table name is based on the relation name)
      const joinTable = result.models.find(
        m => m.modelName === '_PostToCategory',
      );
      expect(joinTable).toBeDefined();
      if (joinTable) {
        expect(joinTable.tableName).toBe('_postToCategory');
        expect(joinTable.originalTableName).toBe('_PostToCategory');
      }
    });
  });

  describe('Relationships', () => {
    it('uses back-references when relationFromFields is only defined on the target', () => {
      const userModel = createModel('User', [
        createField('id', 'String', {isId: true}),
        createField('profile', 'Profile', {
          relationName: 'UserProfile',
          kind: 'object',
        }),
      ]);

      const profileModel = createModel('Profile', [
        createField('id', 'String', {isId: true}),
        createField('userId', 'String'),
        createField('user', 'User', {
          relationName: 'UserProfile',
          kind: 'object',
          relationFromFields: ['userId'],
          relationToFields: ['id'],
        }),
      ]);

      const dmmf = createMockDMMF([userModel, profileModel]);
      const result = transformSchema(dmmf, baseConfig);

      const user = result.models.find(m => m.modelName === 'User');
      expect(user?.relationships.profile).toEqual({
        sourceField: ['id'],
        destField: ['userId'],
        destSchema: 'profileTable',
        type: 'one',
      });
    });

    it('should correctly map one-to-many relationship with composite key on parent', () => {
      const parentModel = createModel(
        'Parent',
        [
          createField('parentId1', 'String'),
          createField('parentId2', 'String'),
          createField('children', 'Child', {
            isList: true,
            relationName: 'ParentToChild',
            kind: 'object',
          }),
        ],
        {
          primaryKey: {
            name: null,
            fields: ['parentId1', 'parentId2'],
          },
        },
      );

      const childModel = createModel('Child', [
        createField('id', 'String', {isId: true}),
        createField('parentFk1', 'String'),
        createField('parentFk2', 'String'),
        createField('parent', 'Parent', {
          relationName: 'ParentToChild',
          kind: 'object',
          relationFromFields: ['parentFk1', 'parentFk2'],
          relationToFields: ['parentId1', 'parentId2'],
        }),
      ]);

      const dmmf = createMockDMMF([parentModel, childModel]);
      const result = transformSchema(dmmf, baseConfig);

      const transformedParent = result.models.find(
        m => m.modelName === 'Parent',
      );
      expect(transformedParent).toBeDefined();
      expect(transformedParent?.relationships).toBeDefined();

      const childrenRelationship = transformedParent?.relationships?.children;
      expect(childrenRelationship).toBeDefined();
      expect(childrenRelationship?.type).toBe('many');

      // Check that the relationship is not a chained one and has the expected fields
      if (
        childrenRelationship &&
        'sourceField' in childrenRelationship &&
        'destField' in childrenRelationship &&
        'destSchema' in childrenRelationship
      ) {
        // Check that the sourceField correctly uses the composite primary key
        expect(childrenRelationship.sourceField).toEqual([
          'parentId1',
          'parentId2',
        ]);
        // Check that the destField correctly uses the foreign key fields from the Child model
        expect(childrenRelationship.destField).toEqual([
          'parentFk1',
          'parentFk2',
        ]);
        expect(childrenRelationship.destSchema).toBe('childTable');
      } else {
        // Fail the test if the relationship structure is not as expected
        expect(childrenRelationship).toHaveProperty('sourceField');
        expect(childrenRelationship).toHaveProperty('destField');
        expect(childrenRelationship).toHaveProperty('destSchema');
      }
    });

    it('maps self-referential implicit many-to-many relationships to distinct join columns', () => {
      const socialUserModel = createModel('SocialUser', [
        createField('id', 'String', {isId: true}),
        createField('blocked', 'SocialUser', {
          isList: true,
          relationName: 'BlockList',
          kind: 'object',
        }),
        createField('blockedBy', 'SocialUser', {
          isList: true,
          relationName: 'BlockList',
          kind: 'object',
        }),
      ]);

      const dmmf = createMockDMMF([socialUserModel]);
      const result = transformSchema(dmmf, baseConfig);

      const socialUser = result.models.find(m => m.modelName === 'SocialUser');
      expect(socialUser).toBeDefined();
      if (!socialUser) {
        throw new Error('SocialUser model not found');
      }

      const blocked = socialUser.relationships.blocked;
      const blockedBy = socialUser.relationships.blockedBy;

      if (!blocked || !blockedBy) {
        throw new Error('Expected SocialUser to have both relationship fields');
      }

      if (!('chain' in blocked) || !('chain' in blockedBy)) {
        throw new Error('Expected chained many-to-many relationships');
      }

      expect(blocked.chain[0]?.destField).toEqual(['A']);
      expect(blocked.chain[1]?.sourceField).toEqual(['B']);

      expect(blockedBy.chain[0]?.destField).toEqual(['B']);
      expect(blockedBy.chain[1]?.sourceField).toEqual(['A']);
    });
  });

  it('should correctly map implicit many-to-many relationships with non-string primary keys', () => {
    const postModel = createModel('Post', [
      createField('id', 'Int', {isId: true}),
      createField('categories', 'Category', {
        isList: true,
        relationName: 'PostToCategory',
        kind: 'object',
      }),
    ]);

    const categoryModel = createModel('Category', [
      createField('id', 'Int', {isId: true}),
      createField('posts', 'Post', {
        isList: true,
        relationName: 'PostToCategory',
        kind: 'object',
      }),
    ]);

    const dmmf = createMockDMMF([postModel, categoryModel]);
    const result = transformSchema(dmmf, {
      ...baseConfig,
      camelCase: true,
    });

    // Find the join table (note: the join table name is based on the relation name)
    const joinTable = result.models.find(
      m => m.modelName === '_PostToCategory',
    );

    expect(joinTable?.columns?.A?.type).toBe('number()');
    expect(joinTable?.columns?.B?.type).toBe('number()');
  });

  describe('array fields', () => {
    it('should include array fields in the schema', () => {
      const model = createModel('User', [
        createField('id', 'String', {isId: true}),
        createField('email', 'String'),
        createField('tags', 'String', {isList: true}),
        createField('scores', 'Int', {isList: true, isRequired: false}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const userModel = result.models[0];
      expect(userModel?.columns).toHaveProperty('tags');
      expect(userModel?.columns).toHaveProperty('scores');

      // Verify array fields are mapped to json with type annotations
      expect(userModel?.columns?.tags?.type).toBe('json<string[]>()');
      expect(userModel?.columns?.scores?.type).toBe('json<number[]>()');
      expect(userModel?.columns?.scores?.isOptional).toBe(true);
    });

    it('should handle enum array fields', () => {
      const model = createModel('Product', [
        createField('id', 'String', {isId: true}),
        createField('name', 'String'),
        createField('categories', 'Category', {kind: 'enum', isList: true}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const productModel = result.models[0];
      expect(productModel?.columns).toHaveProperty('categories');
      expect(productModel?.columns?.categories?.type).toBe(
        'json<Category[]>()',
      );
    });
  });

  describe('unsupported columns', () => {
    it('should skip bytea and unsupported columns', () => {
      const model = createModel('Asset', [
        createField('id', 'String', {isId: true}),
        createField('payload', 'Bytes'),
        createField('legacy', 'LegacyType', {kind: 'unsupported'}),
      ]);

      const dmmf = createMockDMMF([model]);
      const result = transformSchema(dmmf, baseConfig);

      const assetModel = result.models[0];
      expect(assetModel?.columns).toHaveProperty('id');
      expect(assetModel?.columns).not.toHaveProperty('payload');
      expect(assetModel?.columns).not.toHaveProperty('legacy');
    });
  });

  describe('Error handling', () => {
    it('throws when a model has no primary key', () => {
      const model = createModel('NoPK', [createField('name', 'String')]);

      expect(() =>
        transformSchema(createMockDMMF([model]), baseConfig),
      ).toThrow('No primary key found for NoPK');
    });

    it('throws when a relationship target model is missing', () => {
      const model = createModel('Post', [
        createField('id', 'String', {isId: true}),
        createField('author', 'User', {
          relationName: 'Author',
          kind: 'object',
        }),
      ]);

      expect(() =>
        transformSchema(createMockDMMF([model]), baseConfig),
      ).toThrow('Target model User not found for relationship author');
    });

    it('throws when implicit many-to-many models are missing id fields', () => {
      const postModel = createModel('Post', [
        createField('id', 'String', {isId: true}),
        createField('tags', 'Tag', {
          isList: true,
          relationName: 'PostTags',
          kind: 'object',
        }),
      ]);

      const tagModel = createModel(
        'Tag',
        [
          createField('label', 'String'),
          createField('posts', 'Post', {
            isList: true,
            relationName: 'PostTags',
            kind: 'object',
          }),
        ],
        {primaryKey: {fields: ['label'], name: null}},
      );

      expect(() =>
        transformSchema(createMockDMMF([postModel, tagModel]), baseConfig),
      ).toThrow('Implicit relation PostTags: Model Tag has no @id field.');
    });

    it('throws when implicit many-to-many models have primary keys without @id', () => {
      const alphaModel = createModel(
        'Alpha',
        [
          createField('key', 'String'),
          createField('betas', 'Beta', {
            isList: true,
            relationName: 'AlphaBeta',
            kind: 'object',
          }),
        ],
        {primaryKey: {fields: ['key'], name: null}},
      );

      const betaModel = createModel(
        'Beta',
        [
          createField('key', 'String'),
          createField('alphas', 'Alpha', {
            isList: true,
            relationName: 'AlphaBeta',
            kind: 'object',
          }),
        ],
        {primaryKey: {fields: ['key'], name: null}},
      );

      expect(() =>
        transformSchema(createMockDMMF([alphaModel, betaModel]), baseConfig),
      ).toThrow('Implicit relation AlphaBeta: Model Alpha has no @id field.');
    });
  });
});
