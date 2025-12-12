import {describe, expect, it} from 'vitest';
import {transformSchema} from '../src/mappers/schema-mapper';
import type {Config} from '../src/types';
import {createField, createMockDMMF, createModel} from './utils';

describe('Schema Mapper', () => {
  const baseConfig: Config = {
    name: 'test',
    prettier: false,
    resolvePrettierConfig: false,
    camelCase: false,
  };

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
