/**
 * Module dependencies.
 */

import { createSpecifierVisitor, resolveRequiredForm } from '../utils/import-specifier.js';
import { resolveAliasConfig } from '../utils/alias-config.js';
import path from 'node:path';

/**
 * `no-aliased-local` rule.
 *
 * Disallows aliased imports that point inside the importing file's own directory subtree,
 * requiring a relative specifier instead.
 * @type {import('eslint').Rule.RuleModule}
 */

const noAliasedLocal = {
  create(context) {
    const { filename } = context;

    if (!path.isAbsolute(filename)) {
      return {};
    }

    const config = resolveAliasConfig(filename, context.options[0]);

    if (!config) {
      return {};
    }

    const fileDir = path.dirname(filename);

    return createSpecifierVisitor(source => {
      const spec = source.value;

      if (!spec.startsWith(config.prefix)) {
        return;
      }

      const required = resolveRequiredForm(spec, fileDir, config);

      if (!required || !required.startsWith('./')) {
        return;
      }

      context.report({
        data: { required, spec },
        fix: fixer => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], required),
        messageId: 'useRelative',
        node: source
      });
    });
  },
  meta: {
    docs: {
      description: 'Disallow aliased imports for files within the same directory subtree in favor of relative imports'
    },
    fixable: 'code',
    messages: {
      useRelative:
        'Use the relative import "{{required}}" instead of the alias "{{spec}}" for a file in the same directory subtree.'
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          prefix: {
            description:
              'The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports".',
            type: 'string'
          },
          rootDir: {
            description: 'Absolute path the alias prefix maps to. Overrides auto-detection.',
            type: 'string'
          }
        },
        type: 'object'
      }
    ],
    type: 'suggestion'
  }
};

/**
 * Export `no-aliased-local` rule.
 */

export default noAliasedLocal;
