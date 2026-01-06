import {describe, expect, it} from 'vitest';
import {mapPrismaTypeToZero} from '../src/mappers/type-mapper';
import {createField} from './utils';

describe('mapPrismaTypeToZero', () => {
  describe('scalar types', () => {
    it('should map String to string()', () => {
      const field = createField('str', 'String');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Boolean to boolean()', () => {
      const field = createField('bool', 'Boolean');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('boolean()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Int to number()', () => {
      const field = createField('int', 'Int');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Float to number()', () => {
      const field = createField('float', 'Float');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map BigInt to number()', () => {
      const field = createField('bigInt', 'BigInt');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Decimal to number()', () => {
      const field = createField('decimal', 'Decimal');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map DateTime to number() (timestamp)', () => {
      const field = createField('dateTime', 'DateTime');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Json to json()', () => {
      const field = createField('json', 'Json');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json()');
      expect(result?.isOptional).toBe(false);
    });

    it('should return null for Bytes (unsupported in Zero)', () => {
      const field = createField('bytes', 'Bytes');
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });

    it('should return null for unknown scalar types', () => {
      const field = createField('unknown', 'UnknownType');
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });
  });

  describe('PostgreSQL native database types', () => {
    // String native types
    it('should map String with @db.Text to string()', () => {
      const field = createField('text', 'String', {nativeType: ['Text', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.VarChar(n) to string()', () => {
      const field = createField('varchar', 'String', {
        nativeType: ['VarChar', ['255']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.Char(n) to string()', () => {
      const field = createField('char', 'String', {
        nativeType: ['Char', ['10']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.Uuid to string()', () => {
      const field = createField('uuid', 'String', {nativeType: ['Uuid', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.Xml to string()', () => {
      const field = createField('xml', 'String', {nativeType: ['Xml', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.Inet to string()', () => {
      const field = createField('inet', 'String', {nativeType: ['Inet', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.Citext to string()', () => {
      const field = createField('citext', 'String', {
        nativeType: ['Citext', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.Bit(n) to string()', () => {
      const field = createField('bit', 'String', {nativeType: ['Bit', ['8']]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    it('should map String with @db.VarBit to string()', () => {
      const field = createField('varbit', 'String', {
        nativeType: ['VarBit', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
    });

    // Integer native types
    it('should map Int with @db.Integer to number()', () => {
      const field = createField('integer', 'Int', {
        nativeType: ['Integer', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map Int with @db.SmallInt to number()', () => {
      const field = createField('smallint', 'Int', {
        nativeType: ['SmallInt', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map Int with @db.Oid to number()', () => {
      const field = createField('oid', 'Int', {nativeType: ['Oid', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    // BigInt native types
    it('should map BigInt with @db.BigInt to number()', () => {
      const field = createField('bigint', 'BigInt', {
        nativeType: ['BigInt', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    // Float native types
    it('should map Float with @db.DoublePrecision to number()', () => {
      const field = createField('doublePrecision', 'Float', {
        nativeType: ['DoublePrecision', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map Float with @db.Real to number()', () => {
      const field = createField('real', 'Float', {nativeType: ['Real', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    // Decimal native types
    it('should map Decimal with @db.Decimal(p,s) to number()', () => {
      const field = createField('decimal', 'Decimal', {
        nativeType: ['Decimal', ['10', '2']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map Decimal with @db.Money to number()', () => {
      const field = createField('money', 'Decimal', {
        nativeType: ['Money', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    // DateTime native types
    it('should map DateTime with @db.Timestamp(n) to number()', () => {
      const field = createField('timestamp', 'DateTime', {
        nativeType: ['Timestamp', ['6']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map DateTime with @db.Timestamptz(n) to number()', () => {
      const field = createField('timestamptz', 'DateTime', {
        nativeType: ['Timestamptz', ['6']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map DateTime with @db.Date to number()', () => {
      const field = createField('date', 'DateTime', {nativeType: ['Date', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map DateTime with @db.Time(n) to number()', () => {
      const field = createField('time', 'DateTime', {
        nativeType: ['Time', ['6']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    it('should map DateTime with @db.Timetz(n) to number()', () => {
      const field = createField('timetz', 'DateTime', {
        nativeType: ['Timetz', ['6']],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
    });

    // Json native types
    it('should map Json with @db.Json to json()', () => {
      const field = createField('json', 'Json', {nativeType: ['Json', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json()');
    });

    it('should map Json with @db.JsonB to json()', () => {
      const field = createField('jsonb', 'Json', {nativeType: ['JsonB', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json()');
    });

    // Boolean native types
    it('should map Boolean with @db.Boolean to boolean()', () => {
      const field = createField('boolean', 'Boolean', {
        nativeType: ['Boolean', []],
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('boolean()');
    });

    // Bytes native types
    it('should return null for Bytes with @db.ByteA', () => {
      const field = createField('bytea', 'Bytes', {nativeType: ['ByteA', []]});
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });
  });

  describe('enum types', () => {
    it('should map enum types correctly', () => {
      const field = createField('role', 'UserRole', {kind: 'enum'});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('enumeration<UserRole>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should handle optional enum fields', () => {
      const field = createField('role', 'UserRole', {
        kind: 'enum',
        isRequired: false,
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('enumeration<UserRole>()');
      expect(result?.isOptional).toBe(true);
    });

    it('should map enum array types correctly', () => {
      const field = createField('roles', 'UserRole', {
        kind: 'enum',
        isList: true,
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<UserRole[]>()');
      expect(result?.isOptional).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should handle optional String fields correctly', () => {
      const field = createField('str', 'String', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional Int fields correctly', () => {
      const field = createField('int', 'Int', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional Boolean fields correctly', () => {
      const field = createField('bool', 'Boolean', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('boolean()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional DateTime fields correctly', () => {
      const field = createField('dateTime', 'DateTime', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional Json fields correctly', () => {
      const field = createField('json', 'Json', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional BigInt fields correctly', () => {
      const field = createField('bigInt', 'BigInt', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional Decimal fields correctly', () => {
      const field = createField('decimal', 'Decimal', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(true);
    });

    it('should handle optional Float fields correctly', () => {
      const field = createField('float', 'Float', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('number()');
      expect(result?.isOptional).toBe(true);
    });

    it('should return null for optional Bytes fields', () => {
      const field = createField('bytes', 'Bytes', {isRequired: false});
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });
  });

  describe('array types', () => {
    it('should map String[] to json<string[]>()', () => {
      const field = createField('strings', 'String', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<string[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Boolean[] to json<boolean[]>()', () => {
      const field = createField('bools', 'Boolean', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<boolean[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Int[] to json<number[]>()', () => {
      const field = createField('ints', 'Int', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<number[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Float[] to json<number[]>()', () => {
      const field = createField('floats', 'Float', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<number[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map DateTime[] to json<number[]>()', () => {
      const field = createField('dateTimes', 'DateTime', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<number[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Json[] to json<any[]>()', () => {
      const field = createField('jsons', 'Json', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<any[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map BigInt[] to json<number[]>()', () => {
      const field = createField('bigInts', 'BigInt', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<number[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should map Decimal[] to json<number[]>()', () => {
      const field = createField('decimals', 'Decimal', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<number[]>()');
      expect(result?.isOptional).toBe(false);
    });

    it('should return null for Bytes[] (unsupported)', () => {
      const field = createField('bytesArray', 'Bytes', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });

    it('should handle optional array fields correctly', () => {
      const field = createField('tags', 'String', {
        isList: true,
        isRequired: false,
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<string[]>()');
      expect(result?.isOptional).toBe(true);
    });

    it('should return null for unsupported array types', () => {
      const field = createField('unknownArray', 'UnknownType', {isList: true});
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });
  });

  describe('field mapping', () => {
    it('should handle mapped field names with arrays', () => {
      const field = createField('userTags', 'String', {
        isList: true,
        dbName: 'user_tags',
      });
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('json<string[]>()');
      expect(result?.mappedName).toBe('user_tags');
    });

    it('should handle mapped field names with scalars', () => {
      const field = createField('firstName', 'String', {dbName: 'first_name'});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
      expect(result?.mappedName).toBe('first_name');
    });

    it('should return null mappedName when dbName matches name', () => {
      const field = createField('email', 'String', {dbName: 'email'});
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
      expect(result?.mappedName).toBeNull();
    });

    it('should return null mappedName when dbName is undefined', () => {
      const field = createField('email', 'String');
      const result = mapPrismaTypeToZero(field);
      expect(result?.type).toBe('string()');
      expect(result?.mappedName).toBeNull();
    });
  });

  describe('unsupported types', () => {
    it('should return null for unsupported kind', () => {
      const field = createField('unsupported', 'SomeUnsupportedType', {
        kind: 'unsupported',
      });
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });

    it('should return null for object kind (relations)', () => {
      const field = createField('user', 'User', {kind: 'object'});
      const result = mapPrismaTypeToZero(field);
      expect(result).toBeNull();
    });
  });
});
