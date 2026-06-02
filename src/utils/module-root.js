/**
 * Module dependencies.
 */

import path from 'node:path';

/**
 * Convert a path to posix separators, suitable for matching against posix glob patterns.
 * @param {string} value - The path to normalize.
 * @returns {string} The posix-separated path.
 */

function toPosix(value) {
  return value.split(path.sep).join('/');
}

/**
 * Determine whether an absolute target path lives inside an absolute directory.
 * @param {string} dir - The absolute directory.
 * @param {string} target - The absolute target path.
 * @returns {boolean} Whether `target` is strictly inside `dir`.
 */

export function isWithin(dir, target) {
  const relative = path.relative(dir, target);

  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Resolve the module root that governs a file.
 *
 * Walks up from the file's directory toward the alias root, returning the deepest ancestor
 * directory whose path (relative to the alias root, posix) matches one of the glob
 * patterns. Returns null when no patterns are given or no ancestor matches.
 * @param {string} fileDir - The directory of the importing file.
 * @param {string} rootDir - The absolute alias root the patterns are relative to.
 * @param {string[]} patterns - The module-root glob patterns.
 * @returns {string | null} The absolute module-root directory, or null when none matches.
 */

export function resolveModuleRoot(fileDir, rootDir, patterns) {
  if (!patterns || patterns.length === 0) {
    return null;
  }

  for (let dir = fileDir; isWithin(rootDir, dir); dir = path.dirname(dir)) {
    const relative = toPosix(path.relative(rootDir, dir));

    if (patterns.some(pattern => path.posix.matchesGlob(relative, pattern))) {
      return dir;
    }
  }

  return null;
}
