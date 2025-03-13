import cspellPlugin from '@cspell/eslint-plugin';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tsEslint, { ConfigArray } from 'typescript-eslint';
import { fileURLToPath } from 'url';

/**
 * @see{@link https://github.com/typescript-eslint/typescript-eslint/blob/main/eslint.config.mjs}
 */

const tsconfigRootDir = fileURLToPath(new URL('.', import.meta.url));

const config: ConfigArray = tsEslint.config(
    // register all of the plugins up-front
    {
        plugins: {
            '@typescript-eslint': tsEslint.plugin,
            react,
            '@stylistic': stylistic,
            'simple-import-sort': simpleImportSortPlugin,
            '@cspell': cspellPlugin
        }
    },
    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: ['**/node_modules/**', '**/public/**', '**/.next/**']
    },

    // extends ...
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,

    // base config
    {
        languageOptions: {
            globals: { ...globals.es2020, ...globals.browser, ...globals.node },
            parserOptions: {
                projectService: true,
                tsconfigRootDir,
                warnOnUnsupportedTypeScriptVersion: false
            }
        },
        rules: {
            'arrow-body-style': ['error', 'as-needed'],
            'no-empty-pattern': 'warn',
            'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
            'consistent-return': 'warn',
            'prefer-destructuring': ['error', { object: true, array: true }],

            // react
            'react/no-unescaped-entities': 'off',
            'react/self-closing-comp': [
                'error',
                { component: true, html: true }
            ],
            'react/jsx-curly-brace-presence': [
                'error',
                { props: 'never', children: 'never' }
            ],
            'react/jsx-no-target-blank': 'warn',
            'react/jsx-sort-props': [
                'error',
                {
                    reservedFirst: true,
                    callbacksLast: true,
                    noSortAlphabetically: true
                }
            ],
            // typescript
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unsafe-declaration-merging': 'warn',

            // stylistic
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: 'directive', next: '*' },
                { blankLine: 'any', prev: 'directive', next: 'directive' },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['enum', 'interface', 'type']
                }
            ],

            // simple-import-sort
            'simple-import-sort/exports': 'error',
            'simple-import-sort/imports': 'error',
            // spellchecker
            '@cspell/spellchecker': [
                'warn',
                {
                    cspell: {
                        language: 'en',
                        dictionaries: [
                            'typescript',
                            'node',
                            'html',
                            'css',
                            'bash',
                            'npm',
                            'pnpm'
                        ]
                    }
                }
            ]
        }
    },
    eslintConfigPrettier
);

export default config;
