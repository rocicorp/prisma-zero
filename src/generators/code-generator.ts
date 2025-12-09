import type {
  TransformedSchema,
  ZeroModel,
  ZeroRelationship,
  ZeroRelationshipLink,
  ZeroTypeMapping,
} from '../types';

function generateImports(schema: TransformedSchema): string {
  const usedImports = new Set<string>();

  // These are always used
  usedImports.add('table');
  usedImports.add('createSchema');
  usedImports.add('createBuilder');
  // usedImports.add('createCRUDBuilder');

  // Check which type functions are used in the schema
  schema.models.forEach(model => {
    Object.values(model.columns).forEach(mapping => {
      // Extract the base type (e.g., "string()" -> "string", "enumeration(...)" -> "enumeration")
      const baseType = mapping.type.split('(')[0];
      if (baseType) {
        usedImports.add(baseType);
      }
    });

    // Check if this model has relationships
    if (model.relationships && Object.keys(model.relationships).length > 0) {
      usedImports.add('relationships');
    }
  });

  // Sort imports for consistent output
  const sortedImports = Array.from(usedImports).sort();

  return `import {\n  ${sortedImports.join(',\n  ')},\n} from "@rocicorp/zero";\n\n`;
}

function generateUnionTypes(schema: TransformedSchema): string {
  if (schema.enums.length === 0) return '';

  let output = '';
  schema.enums.forEach(enumType => {
    output += `export type ${enumType.name} = `;

    const values = enumType.values.map(value => {
      const enumValue = value.dbName || value.name;
      return `"${enumValue}"`;
    });

    output += values.join(' | ');
    output += ';\n\n';
  });

  return output;
}

function generateColumnDefinition(
  name: string,
  mapping: ZeroTypeMapping,
): string {
  let typeStr = mapping.type;

  // Add .from() if we have a mapped name coming from the @map attribute
  if (mapping.mappedName) {
    typeStr += `.from('${mapping.mappedName}')`;
  }
  if (mapping.isOptional) {
    typeStr += `.optional()`;
  }
  return `    ${name}: ${typeStr}`;
}

function generateModelSchema(model: ZeroModel): string {
  let output = `export const ${model.zeroTableName} = table("${model.tableName}")`;

  // Add .from() if we have an original table name
  if (model.originalTableName) {
    output += `\n  .from("${model.originalTableName}")`;
  }

  output += '\n  .columns({\n';

  Object.entries(model.columns).forEach(([name, mapping]) => {
    output += generateColumnDefinition(name, mapping) + ',\n';
  });

  output += '  })';

  // Add primary key
  output += `\n  .primaryKey(${model.primaryKey.map(key => `"${key}"`).join(', ')});\n\n`;
  return output;
}

function generateRelationshipConfig(rel: ZeroRelationship): string {
  if ('chain' in rel) {
    // Handle chained relationship by passing each link as a separate argument
    return rel.chain
      .map(
        (link: ZeroRelationshipLink) => `{
    sourceField: ${JSON.stringify(link.sourceField)},
    destField: ${JSON.stringify(link.destField)},
    destSchema: ${link.destSchema},
  }`,
      )
      .join(', ');
  } else {
    // Handle direct relationship
    return `{
    sourceField: ${JSON.stringify(rel.sourceField)},
    destField: ${JSON.stringify(rel.destField)},
    destSchema: ${rel.destSchema},
  }`;
  }
}

function generateRelationships(models: ZeroModel[]): string {
  const modelRelationships = models.map(model => {
    if (!model.relationships) return '';

    const relationshipEntries = Object.entries(model.relationships);
    if (relationshipEntries.length === 0) return '';

    const hasOneRelation = relationshipEntries.some(
      ([, rel]) => rel.type === 'one',
    );
    const hasManyRelation = relationshipEntries.some(
      ([, rel]) => rel.type === 'many',
    );

    const relationshipImports = [];
    if (hasOneRelation) relationshipImports.push('one');
    if (hasManyRelation) relationshipImports.push('many');

    const relationshipsStr = relationshipEntries
      .map(([name, rel]) => {
        const configStr = generateRelationshipConfig(rel);
        return `  ${name}: ${rel.type}(${configStr})`;
      })
      .join(',\n');

    return `export const ${model.zeroTableName}Relationships = relationships(${model.zeroTableName}, ({ ${relationshipImports.join(', ')} }) => ({
${relationshipsStr}
}));\n`;
  });

  const filteredRelationships = modelRelationships.filter(Boolean);
  return filteredRelationships.length > 0 ? filteredRelationships.join('') : '';
}

function generateSchema(schema: TransformedSchema): string {
  let output = '/**\n';
  output += ' * The Zero schema object.\n';
  output +=
    ' * This type is auto-generated from your Prisma schema definition.\n';
  output += ' */\n';
  output += 'export const schema = createSchema({\n';
  output += '  tables: [\n';
  schema.models.forEach(model => {
    output += `    ${model.zeroTableName},\n`;
  });
  output += '  ],\n';

  // Add relationships to schema if any exist
  const hasRelationships = schema.models.some(
    model => model.relationships && Object.keys(model.relationships).length > 0,
  );

  if (hasRelationships) {
    output += '  relationships: [\n';
    schema.models.forEach(model => {
      if (model.relationships && Object.keys(model.relationships).length > 0) {
        output += `    ${model.zeroTableName}Relationships,\n`;
      }
    });
    output += '  ],\n';
  }

  output += '});\n\n';

  // Add types
  output += '/**\n';
  output += ' * Represents the Zero schema type.\n';
  output +=
    ' * This type is auto-generated from your Prisma schema definition.\n';
  output += ' */\n';
  output += 'export type Schema = typeof schema;\n';

  output += '/**\n';
  output += ' * Represents the ZQL query builder.\n';
  output +=
    ' * This type is auto-generated from your Prisma schema definition.\n';
  output += ' */\n';
  output += 'export const zql = createBuilder(schema);\n';

  output += '/**\n';
  output += ' * Represents the Zero schema query builder.\n';
  output +=
    ' * This type is auto-generated from your Prisma schema definition.\n';
  output += ' *\n';
  output += ' * @deprecated Use `zql` instead.\n';
  output += ' */\n';
  output += 'export const builder = zql;\n';

  // output += '/**\n';
  // output += ' * Represents the Zero schema CRUD builder.\n';
  // output +=
  //   ' * This type is auto-generated from your Prisma schema definition.\n';
  // output += ' */\n';
  // output += 'export const crud = createCRUDBuilder(schema);\n';

  output += '/** Defines the default types for Zero */\n';
  output += 'declare module "@rocicorp/zero" {\n';
  output += '  interface DefaultTypes {\n';
  output += '    schema: Schema;\n';
  output += '  }\n';
  output += '}\n';

  return output;
}

export function generateCode(schema: TransformedSchema): string {
  let output = `${HEADER_PREFIX}\n\n`;

  output += generateImports(schema);

  output += generateUnionTypes(schema);

  schema.models.forEach(model => {
    output += generateModelSchema(model);
  });

  output += generateRelationships(schema.models);

  output += generateSchema(schema);

  return output;
}

const HEADER_PREFIX = `/* eslint-disable */

// // @ts-nocheck

// // noinspection JSUnusedGlobalSymbols

// // This file was automatically generated by prisma-zero.
// // You should NOT make any changes in this file as it will be overwritten.
// // Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.`;
