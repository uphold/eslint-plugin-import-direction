/**
 * Module dependencies.
 */

import { describe, it } from 'node:test';
import { isWithin, resolveModuleRoot } from './module-root.js';
import assert from 'node:assert/strict';

/**
 * Test `isWithin`.
 */

describe('isWithin()', () => {
  it('should return true for a descendant path', () => {
    assert.equal(isWithin('/repo/src', '/repo/src/a/b.ts'), true);
  });

  it('should return false for the directory itself', () => {
    assert.equal(isWithin('/repo/src', '/repo/src'), false);
  });

  it('should return false for an outside path', () => {
    assert.equal(isWithin('/repo/src', '/repo/other/b.ts'), false);
  });
});

/**
 * Test `resolveModuleRoot`.
 */

describe('resolveModuleRoot()', () => {
  it('should return null when no patterns are given', () => {
    assert.equal(resolveModuleRoot('/repo/src/a', '/repo', []), null);
  });

  it('should return the matching ancestor directory', () => {
    assert.equal(
      resolveModuleRoot('/repo/src/repositories/processes', '/repo', ['src/repositories']),
      '/repo/src/repositories'
    );
  });

  it('should match with a glob pattern', () => {
    assert.equal(resolveModuleRoot('/repo/packages/a/lib', '/repo', ['packages/*']), '/repo/packages/a');
  });

  it('should return the deepest matching ancestor', () => {
    assert.equal(resolveModuleRoot('/repo/src/a/b/c', '/repo', ['src/*', 'src/a/b']), '/repo/src/a/b');
  });

  it('should return null when no ancestor matches', () => {
    assert.equal(resolveModuleRoot('/repo/src/a', '/repo', ['packages/*']), null);
  });
});
