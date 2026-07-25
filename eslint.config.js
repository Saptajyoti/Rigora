import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'client/src/components/ui/**'],
  },
  js.configs.recommended,
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
