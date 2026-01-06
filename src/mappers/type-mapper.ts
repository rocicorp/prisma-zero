import type {DMMF} from '@prisma/generator-helper';
import type {ZeroTypeMapping} from '../types';

const TYPE_MAP: Record<string, string> = {
  String: 'string()',
  Boolean: 'boolean()',
  Int: 'number()',
  Float: 'number()',
  DateTime: 'number()', // Zero uses timestamps
  Json: 'json()',
  BigInt: 'number()',
  Decimal: 'number()',
};

const ARRAY_TS_TYPE_MAP: Record<string, string> = {
  String: 'string[]',
  Boolean: 'boolean[]',
  Int: 'number[]',
  Float: 'number[]',
  DateTime: 'number[]',
  Json: 'any[]',
  BigInt: 'number[]',
  Decimal: 'number[]',
};

export function mapPrismaTypeToZero(
  field: DMMF.Field,
): ZeroTypeMapping | null {
  if (field.kind === 'unsupported') {
    return null;
  }

  const isOptional = !field.isRequired;
  const mappedName =
    field.dbName && field.dbName !== field.name ? field.dbName : null;

  // Handle array types - map them to json() since Zero doesn't support arrays natively
  if (field.isList) {
    const tsType =
      field.kind === 'enum'
        ? `${field.type}[]`
        : ARRAY_TS_TYPE_MAP[field.type];

    if (!tsType) {
      return null;
    }

    return {
      type: `json<${tsType}>()`,
      isOptional,
      mappedName,
    };
  }

  if (field.kind === 'enum') {
    return {
      type: `enumeration<${field.type}>()`,
      isOptional,
      mappedName,
    };
  }

  if (field.kind !== 'scalar') {
    return null;
  }

  const baseType = TYPE_MAP[field.type];
  if (!baseType) {
    return null;
  }

  return {
    type: baseType,
    isOptional,
    mappedName,
  };
}
