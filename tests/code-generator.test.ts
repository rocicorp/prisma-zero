import {describe, expect, it} from 'vitest';
import {generateCode} from '../src/generators/code-generator';
import type {Config, TransformedSchema} from '../src/types';

describe('code generator', () => {
  const defaultConfig: Config = {
    name: 'test',
    prettier: false,
    resolvePrettierConfig: false,
    camelCase: false,
    excludeTables: [],
  };

  it('handles models without relationships and unknown type strings', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'Weird',
          originalTableName: null,
          modelName: 'Weird',
          zeroTableName: 'weirdTable',
          columns: {
            id: {type: 'Custom()', isOptional: false, mappedName: null},
          },
          relationships: undefined as any,
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, defaultConfig);

    expect(output).toContain('export const weirdTable = table("Weird")');
    expect(output).toContain('export const schema = createSchema({');
    expect(output).not.toContain('relationships(');
    expect(output).toContain(
      'import {\n  createBuilder,\n  createSchema,\n  table,\n} from "@rocicorp/zero";',
    );
  });

  it('omits relationships section when none exist', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [],
    };

    const output = generateCode(schema, defaultConfig);

    expect(output).toContain('tables: [\n  ],');
    expect(output).not.toContain('relationships: [');
  });

  it('only includes relationship entries for models that define them', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'WithRel',
          originalTableName: null,
          modelName: 'WithRel',
          zeroTableName: 'withRelTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {
            plain: {
              type: 'one',
              sourceField: ['id'],
              destField: ['id'],
              destSchema: 'plainTable',
            },
          },
          primaryKey: ['id'],
        },
        {
          tableName: 'Plain',
          originalTableName: null,
          modelName: 'Plain',
          zeroTableName: 'plainTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, defaultConfig);

    expect(output).toContain('withRelTableRelationships');
    expect(output).not.toContain('plainTableRelationships');
  });

  it('skips createBuilder import and exports when skipBuilder is true', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {...defaultConfig, skipBuilder: true});

    expect(output).not.toContain('createBuilder');
    expect(output).not.toContain('export const zql');
    expect(output).not.toContain('export const builder');
    expect(output).toContain('createSchema');
  });

  it('includes createBuilder import and exports when skipBuilder is false', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {...defaultConfig, skipBuilder: false});

    expect(output).toContain('createBuilder');
    expect(output).toContain('export const zql = createBuilder(schema);');
    expect(output).toContain('export const builder = zql;');
  });

  it('skips declare module when skipDeclare is true', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {...defaultConfig, skipDeclare: true});

    expect(output).not.toContain('declare module "@rocicorp/zero"');
    expect(output).not.toContain('interface DefaultTypes');
  });

  it('includes declare module when skipDeclare is false', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {...defaultConfig, skipDeclare: false});

    expect(output).toContain('declare module "@rocicorp/zero"');
    expect(output).toContain('interface DefaultTypes');
  });

  it('includes enableLegacyMutators in schema when enabled', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {
      ...defaultConfig,
      enableLegacyMutators: true,
    });

    expect(output).toContain('enableLegacyMutators: true');
  });

  it('includes enableLegacyQueries in schema when enabled', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {
      ...defaultConfig,
      enableLegacyQueries: true,
    });

    expect(output).toContain('enableLegacyQueries: true');
  });

  it('includes both legacy options when both are enabled', () => {
    const schema: TransformedSchema = {
      enums: [],
      models: [
        {
          tableName: 'User',
          originalTableName: null,
          modelName: 'User',
          zeroTableName: 'userTable',
          columns: {
            id: {type: 'string()', isOptional: false, mappedName: null},
          },
          relationships: {},
          primaryKey: ['id'],
        },
      ],
    };

    const output = generateCode(schema, {
      ...defaultConfig,
      enableLegacyMutators: true,
      enableLegacyQueries: true,
    });

    expect(output).toContain('enableLegacyMutators: true');
    expect(output).toContain('enableLegacyQueries: true');
  });
});
