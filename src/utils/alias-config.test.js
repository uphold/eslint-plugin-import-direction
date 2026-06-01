/**
 * Module dependencies.
 */

import { describe, it } from 'node:test';
import { resolveAliasConfig } from './alias-config.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Create a temporary package directory with the given `imports` map.
 * @param {object | undefined} imports - The `imports` field to write.
 * @returns {string} The temporary directory path.
 */

function createPackage(imports) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'import-direction-'));

  fs.mkdirSync(path.join(dir, 'src', 'a'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ imports, name: 'fixture' }));

  return dir;
}

/**
 * Test `resolveAliasConfig`.
 */

describe('resolveAliasConfig()', () => {
  it('should use explicit options and normalize the prefix', () => {
    assert.deepEqual(resolveAliasConfig('/anywhere/file.js', { prefix: '#', rootDir: '/repo' }), {
      base: path.resolve('/repo'),
      prefix: '#/'
    });
  });

  it('should keep an already-slashed prefix', () => {
    assert.deepEqual(resolveAliasConfig('/anywhere/file.js', { prefix: '#/', rootDir: '/repo' }), {
      base: path.resolve('/repo'),
      prefix: '#/'
    });
  });

  it('should discover a root-anchored alias from package.json imports', () => {
    const dir = createPackage({ '#/*': './*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), { base: dir, prefix: '#/' });
  });

  it('should discover an alias from a conditional imports value', () => {
    const dir = createPackage({ '#/*': { default: './*' } });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), { base: dir, prefix: '#/' });
  });

  it('should fill the prefix from detection when only rootDir is provided', () => {
    const dir = createPackage({ '#/*': './*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'), { rootDir: '/repo' }), {
      base: path.resolve('/repo'),
      prefix: '#/'
    });
  });

  it('should fill the base from detection when only prefix is provided', () => {
    const dir = createPackage({ '#/*': './*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'), { prefix: '~' }), {
      base: dir,
      prefix: '~/'
    });
  });

  it('should return null for a partial override with no detectable counterpart', () => {
    const dir = createPackage(undefined);

    assert.equal(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'), { prefix: '~' }), null);
  });

  it('should return a cached config for sibling files in the same subtree', () => {
    const dir = createPackage({ '#/*': './*' });

    fs.mkdirSync(path.join(dir, 'src', 'b'), { recursive: true });

    const first = resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'));
    const second = resolveAliasConfig(path.join(dir, 'src', 'b', 'other.js'));

    assert.deepEqual(first, { base: dir, prefix: '#/' });
    assert.deepEqual(second, first);
  });

  it('should discover an alias mapped to a subdirectory', () => {
    const dir = createPackage({ '#/*': './src/*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), {
      base: path.join(dir, 'src'),
      prefix: '#/'
    });
  });

  it('should return null when no wildcard subpath alias exists', () => {
    const dir = createPackage(undefined);

    assert.equal(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), null);
  });
});
