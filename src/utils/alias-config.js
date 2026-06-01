/**
 * Module dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Cache of resolved alias configurations, keyed by directory.
 */

const configCache = new Map();

/**
 * Parse a `package.json` `imports` map into an alias configuration.
 *
 * Looks for the first wildcard subpath alias of the form `"<prefix>/*": "<dir>/*"`
 * (e.g. `"#/*": "./*"`).
 * @param {object} imports - The `imports` field of a `package.json`.
 * @param {string} packageDir - The directory containing the `package.json`.
 * @returns {{ base: string, prefix: string } | null} The alias config, or null when none exists.
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

    const prefix = key.slice(0, -1);
    const targetDir = target.slice(0, -1);

    return { base: path.resolve(packageDir, targetDir), prefix };
  }

  return null;
}

/**
 * Discover the alias configuration that governs a file.
 *
 * Walks up from the file to the nearest `package.json` and reads its `imports` field. The
 * explicit `prefix`/`rootDir` options override auto-detection; when only one is provided,
 * the missing side is filled from the detected config.
 * @param {string} filename - The absolute path of the file being linted.
 * @param {{ prefix?: string, rootDir?: string }} [options] - Rule options.
 * @returns {{ base: string, prefix: string } | null} The alias config, or null when none is configured.
 */

export function resolveAliasConfig(filename, options = {}) {
  let normalizedPrefix = null;

  if (options.prefix) {
    normalizedPrefix = options.prefix.endsWith('/') ? options.prefix : `${options.prefix}/`;
  }

  const overrideBase = options.rootDir ? path.resolve(options.rootDir) : null;

  // Fully explicit override; skip auto-detection entirely.
  if (normalizedPrefix && overrideBase) {
    return { base: overrideBase, prefix: normalizedPrefix };
  }

  // Auto-detect from the nearest package.json, caching every visited directory.
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

  // No overrides: use detection as-is.
  if (!normalizedPrefix && !overrideBase) {
    return detected;
  }

  // Partial override: fill the missing side from detection.
  const base = overrideBase ?? detected?.base ?? null;
  const prefix = normalizedPrefix ?? detected?.prefix ?? null;

  if (!base || !prefix) {
    return null;
  }

  return { base, prefix };
}
