/**
 * Module dependencies.
 */

import { createSpecifierVisitor, resolveRequiredForm } from '../utils/import-specifier.js';
import { resolveAliasConfig } from '../utils/alias-config.js';
import path from 'node:path';

/**
 * `no-relative-parent` rule.
 *
 * Disallows relative parent imports (specifiers starting with `../`), requiring the
 * configured root alias instead.
 * @type {import('eslint').Rule.RuleModule}
 */

const noRelativeParent = {
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

      if (!spec.startsWith('../')) {
        return;
      }

      const required = resolveRequiredForm(spec, fileDir, config);

      if (!required) {
        context.report({ data: { spec }, messageId: 'noAlias', node: source });

        return;
      }

      if (required === spec) {
        return;
      }

      context.report({
        data: { required, spec },
        fix: fixer => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], required),
        messageId: 'useAlias',
        node: source
      });
    });
  },
  meta: {
    docs: {
      description: 'Disallow relative parent imports in favor of the configured root alias'
    },
    fixable: 'code',
    messages: {
      noAlias: 'Parent import "{{spec}}" resolves outside the alias root and cannot be aliased.',
      useAlias: 'Use the root alias "{{required}}" instead of the relative parent import "{{spec}}".'
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
 * Export `no-relative-parent` rule.
 */

export default noRelativeParent;
