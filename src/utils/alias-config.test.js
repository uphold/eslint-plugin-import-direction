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
    assert.deepEqual(resolveAliasConfig('/anywhere/file.js', { aliasPrefix: '#', rootDir: '/repo' }), {
      aliasPrefix: '#/',
      moduleRootDir: null,
      rootDir: path.resolve('/repo')
    });
  });

  it('should keep an already-slashed prefix', () => {
    assert.deepEqual(resolveAliasConfig('/anywhere/file.js', { aliasPrefix: '#/', rootDir: '/repo' }), {
      aliasPrefix: '#/',
      moduleRootDir: null,
      rootDir: path.resolve('/repo')
    });
  });

  it('should discover a root-anchored alias from package.json imports', () => {
    const dir = createPackage({ '#/*': './*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), {
      aliasPrefix: '#/',
      moduleRootDir: null,
      rootDir: dir
    });
  });

  it('should discover an alias from a conditional imports value', () => {
    const dir = createPackage({ '#/*': { default: './*' } });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), {
      aliasPrefix: '#/',
      moduleRootDir: null,
      rootDir: dir
    });
  });

  it('should fill the prefix from detection when only rootDir is provided', () => {
    const dir = createPackage({ '#/*': './*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'), { rootDir: '/repo' }), {
      aliasPrefix: '#/',
      moduleRootDir: null,
      rootDir: path.resolve('/repo')
    });
  });

  it('should fill the root from detection when only prefix is provided', () => {
    const dir = createPackage({ '#/*': './*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'), { aliasPrefix: '~' }), {
      aliasPrefix: '~/',
      moduleRootDir: null,
      rootDir: dir
    });
  });

  it('should resolve the module root from moduleRoots', () => {
    const dir = createPackage({ '#/*': './*' });

    fs.mkdirSync(path.join(dir, 'src', 'a', 'inner'), { recursive: true });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'inner', 'file.js'), { moduleRoots: ['src/a'] }), {
      aliasPrefix: '#/',
      moduleRootDir: path.join(dir, 'src', 'a'),
      rootDir: dir
    });
  });

  it('should return null for a partial override with no detectable counterpart', () => {
    const dir = createPackage(undefined);

    assert.equal(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'), { aliasPrefix: '~' }), null);
  });

  it('should return a cached config for sibling files in the same subtree', () => {
    const dir = createPackage({ '#/*': './*' });

    fs.mkdirSync(path.join(dir, 'src', 'b'), { recursive: true });

    const first = resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js'));
    const second = resolveAliasConfig(path.join(dir, 'src', 'b', 'other.js'));

    assert.deepEqual(first, { aliasPrefix: '#/', moduleRootDir: null, rootDir: dir });
    assert.deepEqual(second, first);
  });

  it('should discover an alias mapped to a subdirectory', () => {
    const dir = createPackage({ '#/*': './src/*' });

    assert.deepEqual(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), {
      aliasPrefix: '#/',
      moduleRootDir: null,
      rootDir: path.join(dir, 'src')
    });
  });

  it('should return null when no wildcard subpath alias exists', () => {
    const dir = createPackage(undefined);

    assert.equal(resolveAliasConfig(path.join(dir, 'src', 'a', 'file.js')), null);
  });
});
