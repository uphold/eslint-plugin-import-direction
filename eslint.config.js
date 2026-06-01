/**
 * Module dependencies.
 */

import { createJavaScriptConfig } from 'eslint-config-uphold';
import { defineConfig } from 'eslint/config';

/**
 * Export ESLint configuration.
 */

export default defineConfig([
  createJavaScriptConfig('module'),
  {
    // ESLint rules and resolvers run synchronously, so synchronous file system access is required.
    rules: {
      'n/no-sync': 'off'
    }
  }
]);
