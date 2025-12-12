import type {DMMF, GeneratorOptions} from '@prisma/generator-helper';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createEnum, createField, createMockDMMF, createModel} from './utils';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
}));

function createTestOptions(dmmf: DMMF.Document): GeneratorOptions {
  return {
    generator: {
      output: {value: 'generated', fromEnvVar: null},
      name: 'test-generator',
      config: {},
      provider: {value: 'test-provider', fromEnvVar: null},
      binaryTargets: [],
      previewFeatures: [],
      sourceFilePath: '',
    },
    dmmf,
    schemaPath: '',
    datasources: [],
    otherGenerators: [],
    version: '0.0.0',
    datamodel: '',
  };
}

describe('Generator configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock('prettier');
    vi.unmock('@prisma/generator-helper');
  });

  it('throws when output directory is missing', async () => {
    const {onGenerate} = await import('../src/generator');

    const options = createTestOptions(createMockDMMF([]));
    (options.generator as any).output = undefined;

    await expect(onGenerate(options)).rejects.toThrow(
      'Output directory is required',
    );
  });

  it('formats output with prettier when enabled', async () => {
    const format = vi.fn(
      async (code: string, options?: unknown) =>
        `formatted:${code}-${JSON.stringify(options)}`,
    );
    const resolveConfig = vi.fn(async () => ({semi: false}));

    vi.doMock('prettier', () => ({
      format,
      resolveConfig,
    }));

    const {onGenerate} = await import('../src/generator');
    const options = createTestOptions(
      createMockDMMF(
        [
          createModel('User', [
            createField('id', 'String', {isId: true}),
            createField('role', 'Role', {kind: 'enum'}),
          ]),
        ],
        [createEnum('Role', ['ADMIN'])],
      ),
    );
    options.generator.config.prettier = 'true';

    await onGenerate(options);

    expect(resolveConfig).toHaveBeenCalledWith('schema.ts');
    expect(format).toHaveBeenCalled();
    const formatOptions = format.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(formatOptions?.parser).toBe('typescript');
  });

  it('throws a helpful error when prettier cannot be loaded', async () => {
    vi.doMock('prettier', () => {
      throw new Error('module not found');
    });

    const {onGenerate} = await import('../src/generator');
    const options = createTestOptions(createMockDMMF([]));
    options.generator.config.prettier = 'true';

    await expect(onGenerate(options)).rejects.toThrow(
      '⚠️  prisma-zero: prettier could not be found. Install it locally with\n  npm i -D prettier',
    );
  });

  it('skips resolving prettier config when disabled', async () => {
    const format = vi.fn(async (code: string) => code);
    const resolveConfig = vi.fn();

    vi.doMock('prettier', () => ({
      format,
      resolveConfig,
    }));

    const {onGenerate} = await import('../src/generator');
    const options = createTestOptions(createMockDMMF([]));
    options.generator.config.prettier = 'true';
    options.generator.config.resolvePrettierConfig = 'false';

    await onGenerate(options);

    expect(resolveConfig).not.toHaveBeenCalled();
    expect(format).toHaveBeenCalled();
  });

  it('validates excludeTables configuration', async () => {
    const {onGenerate} = await import('../src/generator');
    const options = createTestOptions(createMockDMMF([]));
    options.generator.config.excludeTables = 'posts' as any;

    await expect(onGenerate(options)).rejects.toThrow(
      'excludeTables must be an array',
    );
  });

  it('passes excludeTables through to schema transformation', async () => {
    const mapperModule = await import('../src/mappers/schema-mapper');
    const transformSpy = vi.spyOn(mapperModule, 'transformSchema');
    const {onGenerate} = await import('../src/generator');

    const options = createTestOptions(
      createMockDMMF([
        createModel('User', [
          createField('id', 'String', {isId: true}),
          createField('name', 'String'),
        ]),
      ]),
    );
    options.generator.config.excludeTables = ['User'];

    await onGenerate(options);

    expect(transformSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({excludeTables: ['User']}),
    );
  });

  it('exposes manifest information through generatorHandler', async () => {
    const handler = vi.fn();
    vi.doMock('@prisma/generator-helper', () => ({
      default: {generatorHandler: handler},
      generatorHandler: handler,
    }));

    const {version} = await import('../package.json');
    await import('../src/generator');

    expect(handler).toHaveBeenCalledTimes(1);
    const manifest = handler.mock.calls[0]?.[0]?.onManifest?.();
    expect(manifest).toEqual({
      version,
      defaultOutput: 'generated/zero',
      prettyName: 'Zero Schema',
    });
  });
});
