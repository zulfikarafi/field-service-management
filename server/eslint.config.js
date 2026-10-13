import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import nodePlugin from 'eslint-plugin-node';

export default tseslint.config(
  // Ignore build output, deps, and generated files
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'src/generated/**',
      'prisma/seed.ts',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // Base JS + TypeScript recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project rules for source files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier,
      node: nodePlugin,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      // Allow intentional patterns used in this codebase
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off', // e.g. Request<{}, {}, Body>
      '@typescript-eslint/no-namespace': 'off', // Express Request augmentation
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // eslint-plugin-node is registered so inline disable directives resolve,
      // but keep its process.env rule off (env access is intentional here).
      'node/no-process-env': 'off',
    },
  },

  // Disable formatting rules that conflict with Prettier
  prettierConfig,
);
