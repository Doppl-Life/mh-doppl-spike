import { it } from 'vitest';

/**
 * Harness-only runner for the live view-data generator. Skipped during normal
 * `vitest run`; execute explicitly with:
 *
 *   GEN_VIEW=1 node ./node_modules/vitest/vitest.mjs run test/generator.test.ts
 *
 * (Workaround: `tsx` can't be installed here because the run-toolkit intercepts
 * package-manager `install`/`add` commands. esbuild via vitest already works.)
 */
it.runIf(process.env['GEN_VIEW'] === '1')(
  'build-view-data: parses real skills, writes JSON, prints drift',
  async () => {
    await import('../scripts/build-view-data');
  },
);
