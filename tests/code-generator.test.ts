import {describe, expect, it} from 'vitest';
import {generateCode} from '../src/generators/code-generator';
import type {TransformedSchema} from '../src/types';

describe('code generator', () => {
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

    const output = generateCode(schema);

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

    const output = generateCode(schema);

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

    const output = generateCode(schema);

    expect(output).toContain('withRelTableRelationships');
    expect(output).not.toContain('plainTableRelationships');
  });
});
