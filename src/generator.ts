import {
  type GeneratorConfig,
  generatorHandler,
  type GeneratorOptions,
} from '@prisma/generator-helper';
import {mkdir, writeFile} from 'fs/promises';
import {join} from 'path';
import {version} from '../package.json';
import {generateCode} from './generators/code-generator';
import {transformSchema} from './mappers/schema-mapper';
import type {Config} from './types';

export async function onGenerate(options: GeneratorOptions) {
  const {generator, dmmf} = options;
  const outputFile = 'schema.ts';
  const outputDir = generator.output?.value;

  if (!outputDir) {
    throw new Error('Output directory is required');
  }

  const config = {
    name: generator.name,
    prettier: generator.config.prettier === 'true', // Default false,
    resolvePrettierConfig: generator.config.resolvePrettierConfig !== 'false', // Default true
    camelCase: generator.config.camelCase === 'true', // Default false
    excludeTables: loadExcludeTables(generator), 
  } satisfies Config;

  // Transform the schema
  const transformedSchema = transformSchema(dmmf, config);

  // Generate code
  let output = generateCode(transformedSchema);

  // Apply prettier if configured
  if (config.prettier) {
    let prettier: typeof import('prettier');
    try {
      prettier = await import('prettier');
    } catch {
      throw new Error(
        '⚠️  prisma-zero: prettier could not be found. Install it locally with\n  npm i -D prettier',
      );
    }

    const prettierOptions = config.resolvePrettierConfig
      ? await prettier.resolveConfig(outputFile)
      : null;

    output = await prettier.format(output, {
      ...prettierOptions,
      parser: 'typescript',
    });
  }

  await mkdir(outputDir, {recursive: true});
  await writeFile(join(outputDir, outputFile), output);
}

// Use the exported function in the generator handler
generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: 'generated/zero',
      prettyName: 'Zero Schema',
    };
  },
  onGenerate,
});

/**
 * Load the excludeTables from the generator config
 */
function loadExcludeTables(generator: GeneratorConfig) {
  const value = generator.config.excludeTables;

  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('excludeTables must be an array');
  }

  return value;
}
