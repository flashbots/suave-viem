import { join } from 'node:path'
import { defineConfig } from 'vitest/config'
import { JsonReporter } from 'vitest/reporters'

export default defineConfig({
  test: {
    alias: {
      '~viem': join(__dirname, '../src'),
      '~test': join(__dirname, '.'),
    },
    benchmark: {
      outputFile: './bench/report.json',
      reporters: process.env.CI
        ? [new JsonReporter({ outputFile: './bench/report.json' })]
        : ['verbose'],
    },
    coverage: {
      reporter: process.env.CI ? ['lcov'] : ['text', 'json', 'html'],
      exclude: [
        '**/errors/utils.ts',
        '**/_cjs/**',
        '**/_esm/**',
        '**/_types/**',
        '**/*.test.ts',
        '**/test/**',
      ],
    },
    environment: 'node',
    include: ['src/chains/suave/*.test.ts'],
    exclude: [],
    setupFiles: [join(__dirname, './setup.ts')],
    globalSetup: [join(__dirname, './globalSetup.ts')],
    testTimeout: 10_000,
  },
})
