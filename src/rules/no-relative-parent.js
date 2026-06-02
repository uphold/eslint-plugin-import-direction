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

      const requiredForm = resolveRequiredForm(spec, fileDir, config);

      if (!requiredForm) {
        context.report({ data: { spec }, messageId: 'noAlias', node: source });

        return;
      }

      // A relative required form means the parent import is allowed to stay relative
      // (e.g. it stays within the file's module root).
      if (requiredForm.type === 'relative') {
        return;
      }

      context.report({
        data: { required: requiredForm.specifier, spec },
        fix: fixer => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], requiredForm.specifier),
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
          aliasPrefix: {
            description:
              'The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports".',
            type: 'string'
          },
          moduleRoots: {
            description:
              'Glob patterns (relative to the alias root, in posix form) marking module-root directories. Relative parent imports that stay within the same module root are allowed instead of requiring the alias.',
            items: { type: 'string' },
            type: 'array'
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
