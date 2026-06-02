/**
 * Module dependencies.
 */

import { isWithin } from './module-root.js';
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
 * @param {{ aliasPrefix: string, rootDir: string } | null} config - The resolution context.
 * @returns {string | null} The resolved absolute path, or null for bare specifiers.
 */

function resolveTarget(spec, fileDir, config) {
  if (spec.startsWith('./') || spec.startsWith('../')) {
    return path.resolve(fileDir, spec);
  }

  if (config && spec.startsWith(config.aliasPrefix)) {
    return path.join(config.rootDir, spec.slice(config.aliasPrefix.length));
  }

  return null;
}

/**
 * Resolve the canonical specifier an import should use.
 *
 * Targets inside the relative zone — the file's module root when one applies, otherwise
 * the file's own directory subtree — must be relative (possibly `../`); targets above it
 * must use the alias. Returns null for bare specifiers and when an ancestor target falls
 * outside the alias root (no alias can represent it).
 * @param {string} spec - The import specifier.
 * @param {string} fileDir - The directory of the importing file.
 * @param {{ aliasPrefix: string, moduleRootDir?: string | null, rootDir: string } | null} config - The resolution context.
 * @returns {{ specifier: string, type: 'alias' | 'relative' } | null} The canonical specifier and
 *   its kind, or null when none can be formed.
 */

export function resolveRequiredForm(spec, fileDir, config) {
  const target = resolveTarget(spec, fileDir, config);

  if (!target) {
    return null;
  }

  const boundary = config?.moduleRootDir ?? fileDir;

  if (isWithin(boundary, target)) {
    const relative = toPosix(path.relative(fileDir, target));

    return { specifier: relative.startsWith('../') ? relative : `./${relative}`, type: 'relative' };
  }

  if (!config) {
    return null;
  }

  const fromRoot = path.relative(config.rootDir, target);

  if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) {
    return null;
  }

  return { specifier: `${config.aliasPrefix}${toPosix(fromRoot)}`, type: 'alias' };
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
