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

      if (!spec.startsWith(config.aliasPrefix)) {
        return;
      }

      const requiredForm = resolveRequiredForm(spec, fileDir, config);

      if (!requiredForm || requiredForm.type !== 'relative') {
        return;
      }

      context.report({
        data: { required: requiredForm.specifier, spec },
        fix: fixer => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], requiredForm.specifier),
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
          aliasPrefix: {
            description:
              'The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports".',
            type: 'string'
          },
          moduleRoots: {
            description:
              'Glob patterns (relative to the alias root, in posix form) marking module-root directories. Aliased imports to a file within the same module root are rewritten to a relative import.',
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
 * Export `no-aliased-local` rule.
 */

export default noAliasedLocal;
