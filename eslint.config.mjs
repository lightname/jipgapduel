import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'node_modules/**',
    'qa/**',
    'data/**',
    'test-results/**',
    'playwright-report/**',
    'next-env.d.ts',
    '연동결과-부동산실거래/**',
    '연동결과-부동산위치/**',
  ]),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@config',
              importNames: ['secrets'],
              message: 'secrets는 scripts/에서만 import할 수 있습니다.',
            },
            {
              name: '../../config',
              importNames: ['secrets'],
              message: 'secrets는 scripts/에서만 import할 수 있습니다.',
            },
            {
              name: '../../../config',
              importNames: ['secrets'],
              message: 'secrets는 scripts/에서만 import할 수 있습니다.',
            },
          ],
          patterns: [
            {
              group: ['**/scripts/**', 'scripts/**'],
              message: 'src/에서 scripts/ 경로를 import할 수 없습니다.',
            },
          ],
        },
      ],
    },
  },
]);
