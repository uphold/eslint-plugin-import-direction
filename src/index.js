/**
 * Module dependencies.
 */

import { createRequire } from 'node:module';
import noAliasedLocal from './rules/no-aliased-local.js';
import noRelativeParent from './rules/no-relative-parent.js';

/**
 * Package metadata.
 */

const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

/**
 * Plugin definition.
 * @type {import('eslint').ESLint.Plugin}
 */

const plugin = {
  configs: {},
  meta: { name, version },
  rules: {
    'no-aliased-local': noAliasedLocal,
    'no-relative-parent': noRelativeParent
  }
};

/**
 * Recommended flat configuration.
 */

plugin.configs.recommended = {
  name: 'import-direction/recommended',
  plugins: { '@uphold/import-direction': plugin },
  rules: {
    '@uphold/import-direction/no-aliased-local': 'error',
    '@uphold/import-direction/no-relative-parent': 'error'
  }
};

/**
 * Export plugin.
 */

export default plugin;
