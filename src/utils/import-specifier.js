/**
 * Module dependencies.
 */

import path from 'node:path';

/**
 * Convert a path to posix separators, suitable for use in an import specifier.
 * @param {string} value - The path to normalize.
 * @returns {string} The posix-separated path.
 */

function toPosix(value) {
  return value.split(path.sep).join('/');
}

/**
 * Resolve the absolute target path of an import specifier.
 * @param {string} spec - The import specifier.
 * @param {string} fileDir - The directory of the importing file.
 * @param {{ base: string, prefix: string } | null} config - The alias config.
 * @returns {string | null} The resolved absolute path, or null for bare specifiers.
 */

function resolveTarget(spec, fileDir, config) {
  if (spec.startsWith('./') || spec.startsWith('../')) {
    return path.resolve(fileDir, spec);
  }

  if (config && spec.startsWith(config.prefix)) {
    return path.join(config.base, spec.slice(config.prefix.length));
  }

  return null;
}

/**
 * Compute the canonical specifier for a resolved target.
 *
 * Targets inside the importing file's directory subtree must be relative; targets above
 * it must use the alias. Returns null when an ancestor target falls outside the alias
 * base (no alias can represent it).
 * @param {string} target - The resolved absolute target path.
 * @param {string} fileDir - The directory of the importing file.
 * @param {{ base: string, prefix: string } | null} config - The alias config.
 * @returns {string | null} The canonical specifier, or null when none can be formed.
 */

function requiredForm(target, fileDir, config) {
  const relative = path.relative(fileDir, target);

  if (relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)) {
    return `./${toPosix(relative)}`;
  }

  if (!config) {
    return null;
  }

  const fromBase = path.relative(config.base, target);

  if (fromBase.startsWith('..') || path.isAbsolute(fromBase)) {
    return null;
  }

  return `${config.prefix}${toPosix(fromBase)}`;
}

/**
 * Resolve the canonical specifier an import should use, composing target resolution with
 * the required-form computation.
 * @param {string} spec - The import specifier.
 * @param {string} fileDir - The directory of the importing file.
 * @param {{ base: string, prefix: string } | null} config - The alias config.
 * @returns {string | null} The canonical specifier, or null when none can be formed.
 */

export function resolveRequiredForm(spec, fileDir, config) {
  const target = resolveTarget(spec, fileDir, config);

  if (!target) {
    return null;
  }

  return requiredForm(target, fileDir, config);
}

/**
 * Build an ESLint visitor that invokes a callback with the source literal of every static
 * import, re-export, and dynamic import that has a string-literal source.
 * @param {(source: import('estree').Literal) => void} check - Callback for each source literal.
 * @returns {Record<string, (node: object) => void>} The ESLint visitor.
 */

export function createSpecifierVisitor(check) {
  /**
   * Invoke the callback when a node carries a string-literal source.
   * @param {{ source?: object | null }} node - The node to inspect.
   */
  function visit(node) {
    const { source } = node;

    if (source && source.type === 'Literal' && typeof source.value === 'string') {
      check(source);
    }
  }

  return {
    ExportAllDeclaration: visit,
    ExportNamedDeclaration: visit,
    ImportDeclaration: visit,
    ImportExpression: visit
  };
}
