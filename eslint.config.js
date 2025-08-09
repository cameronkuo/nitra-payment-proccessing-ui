import js from '@eslint/js';
import pluginQuasar from '@quasar/app-vite/eslint';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfigWithVueTs(
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []
  },

  pluginQuasar.configs.recommended(),
  js.configs.recommended,

  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs['flat/essential'],

  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  // https://github.com/vuejs/eslint-config-typescript
  vueTsConfigs.recommendedTypeChecked,

  // https://github.com/import-js/eslint-plugin-import
  importPlugin.flatConfigs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },

    settings: {
      'import/resolver': {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },

    // add your custom rules here
    rules: {
      'prefer-promise-reject-errors': 'off',

      // allow debugger during development only
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      'vue/attributes-order': ['warn', { alphabetical: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      'import/order': [
        'error',
        {
          // How groups are defined, and the order to respect.
          // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#groups-array
          groups: [
            'builtin',
            'external',
            'internal',
            'unknown',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#pathgroups-array-of-objects
          pathGroups: [
            {
              pattern: 'components/**',
              group: 'unknown', // 在規定的 group 中選其一，builtin、external、internal、unknown、parent、sibling、index、object、type
              position: 'after', // after、before
            },
            {
              pattern: 'src/**',
              group: 'internal', // 在規定的 group 中選其一，builtin、external、internal、unknown、parent、sibling、index、object、type
              position: 'after', // after、before
            },
          ],
          // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#pathgroupsexcludedimporttypes-array
          pathGroupsExcludedImportTypes: ['type'], // 將 type 類型的 import 排除在 pathGroups 之外
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  {
    files: ['src-pwa/custom-service-worker.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  prettierSkipFormatting,
);
