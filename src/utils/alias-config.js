/**
 * Module dependencies.
 */

import { resolveModuleRoot } from './module-root.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Cache of detected alias configurations, keyed by directory.
 */

const configCache = new Map();

/**
 * Parse a `package.json` `imports` map into an alias configuration.
 *
 * Looks for the first wildcard subpath alias of the form `"<prefix>/*": "<dir>/*"`
 * (e.g. `"#/*": "./*"`).
 * @param {object} imports - The `imports` field of a `package.json`.
 * @param {string} packageDir - The directory containing the `package.json`.
 * @returns {{ aliasPrefix: string, rootDir: string } | null} The alias config, or null when none exists.
 */

function parseImports(imports, packageDir) {
  if (!imports || typeof imports !== 'object') {
    return null;
  }

  for (const [key, value] of Object.entries(imports)) {
    if (!key.endsWith('/*')) {
      continue;
    }

    let target = typeof value === 'string' ? value : null;

    if (value && typeof value === 'object') {
      for (const condition of ['default', 'node', 'import', 'require']) {
        if (typeof value[condition] === 'string') {
          target = value[condition];

          break;
        }
      }
    }

    if (typeof target !== 'string' || !target.endsWith('/*')) {
      continue;
    }

    const aliasPrefix = key.slice(0, -1);
    const targetDir = target.slice(0, -1);

    return { aliasPrefix, rootDir: path.resolve(packageDir, targetDir) };
  }

  return null;
}

/**
 * Auto-detect the alias configuration for a file from the nearest `package.json`,
 * caching every visited directory. The result depends only on the directory tree, never
 * on rule options, which is what makes the shared cache safe.
 * @param {string} filename - The absolute path of the file being linted.
 * @returns {{ aliasPrefix: string, rootDir: string } | null} The detected config, or null.
 */

function detectPackageConfig(filename) {
  let detected = null;
  const visited = [];

  for (let dir = path.dirname(filename); ; dir = path.dirname(dir)) {
    if (configCache.has(dir)) {
      detected = configCache.get(dir);

      break;
    }

    visited.push(dir);

    const packageJsonPath = path.join(dir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        detected = parseImports(pkg.imports, dir);
      } catch {
        detected = null;
      }

      break;
    }

    if (path.dirname(dir) === dir) {
      break;
    }
  }

  for (const dir of visited) {
    configCache.set(dir, detected);
  }

  return detected;
}

/**
 * Discover the import-direction context that governs a file.
 *
 * The alias root and prefix are auto-detected from the nearest `package.json` `imports`
 * field; the explicit `aliasPrefix`/`rootDir` options override that detection, and when only
 * one is provided the missing side is filled from detection. The module root (the deepest
 * ancestor matching `moduleRoots`) is resolved per file and never cached, since it depends
 * on the `moduleRoots` option.
 * @param {string} filename - The absolute path of the file being linted.
 * @param {{ aliasPrefix?: string, moduleRoots?: string[], rootDir?: string }} [options] - Rule options.
 * @returns {{ aliasPrefix: string, moduleRootDir: string | null, rootDir: string } | null} The
 *   resolution context, or null when no alias is configured.
 */

export function resolveAliasConfig(filename, options = {}) {
  let aliasPrefix = null;
  let rootDir = null;

  if (options.aliasPrefix) {
    aliasPrefix = options.aliasPrefix.endsWith('/') ? options.aliasPrefix : `${options.aliasPrefix}/`;
  }

  if (options.rootDir) {
    rootDir = path.resolve(options.rootDir);
  }

  // Auto-detect from package.json, unless both sides are explicitly overridden.
  if (!aliasPrefix || !rootDir) {
    const detected = detectPackageConfig(filename);

    aliasPrefix ??= detected?.aliasPrefix;
    rootDir ??= detected?.rootDir;
  }

  if (!aliasPrefix || !rootDir) {
    return null;
  }

  const moduleRootDir = resolveModuleRoot(path.dirname(filename), rootDir, options.moduleRoots ?? []);

  return { aliasPrefix, moduleRootDir, rootDir };
}
