/**
 * Module dependencies.
 */

import { createSpecifierVisitor, resolveRequiredForm } from './import-specifier.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Test `resolveRequiredForm`.
 */

describe('resolveRequiredForm()', () => {
  const config = { aliasPrefix: '#/', rootDir: '/repo' };

  it('should require the alias for a parent import that resolves inside the root', () => {
    assert.deepEqual(resolveRequiredForm('../x.ts', '/repo/src/a', config), { specifier: '#/src/x.ts', type: 'alias' });
    assert.deepEqual(resolveRequiredForm('../../config/types.ts', '/repo/src/a', config), {
      specifier: '#/config/types.ts',
      type: 'alias'
    });
  });

  it('should return null for a parent import that resolves outside the root', () => {
    assert.equal(resolveRequiredForm('../outside.ts', '/repo', config), null);
  });

  it('should require a relative specifier for an aliased import in the same subtree', () => {
    assert.deepEqual(resolveRequiredForm('#/src/a/x.ts', '/repo/src/a', config), {
      specifier: './x.ts',
      type: 'relative'
    });
    assert.deepEqual(resolveRequiredForm('#/src/a/sub/x.ts', '/repo/src/a', config), {
      specifier: './sub/x.ts',
      type: 'relative'
    });
  });

  it('should keep an aliased import that points to an ancestor inside the root', () => {
    assert.deepEqual(resolveRequiredForm('#/config/types.ts', '/repo/src/a', config), {
      specifier: '#/config/types.ts',
      type: 'alias'
    });
  });

  it('should keep a relative import that stays within the subtree', () => {
    assert.deepEqual(resolveRequiredForm('./x.ts', '/repo/src/a', config), { specifier: './x.ts', type: 'relative' });
    assert.deepEqual(resolveRequiredForm('./sub/x.ts', '/repo/src/a', config), {
      specifier: './sub/x.ts',
      type: 'relative'
    });
  });

  it('should resolve aliases mapped to a subdirectory root', () => {
    const subConfig = { aliasPrefix: '#/', rootDir: '/repo/src' };

    assert.deepEqual(resolveRequiredForm('../x.ts', '/repo/src/a', subConfig), { specifier: '#/x.ts', type: 'alias' });
  });

  it('should require a relative parent specifier within a module root', () => {
    const moduleConfig = { aliasPrefix: '#/', moduleRootDir: '/repo/src/repositories', rootDir: '/repo' };

    assert.deepEqual(
      resolveRequiredForm('#/src/repositories/utils/db.ts', '/repo/src/repositories/processes', moduleConfig),
      { specifier: '../utils/db.ts', type: 'relative' }
    );
    assert.deepEqual(resolveRequiredForm('../utils/db.ts', '/repo/src/repositories/processes', moduleConfig), {
      specifier: '../utils/db.ts',
      type: 'relative'
    });
  });

  it('should require the alias for an import that leaves the module root', () => {
    const moduleConfig = { aliasPrefix: '#/', moduleRootDir: '/repo/src/repositories', rootDir: '/repo' };

    assert.deepEqual(resolveRequiredForm('../../foo.ts', '/repo/src/repositories/processes', moduleConfig), {
      specifier: '#/src/foo.ts',
      type: 'alias'
    });
  });

  it('should return null for bare specifiers', () => {
    assert.equal(resolveRequiredForm('lodash', '/repo/src/a', config), null);
    assert.equal(resolveRequiredForm('node:fs', '/repo/src/a', config), null);
  });
});

/**
 * Test `createSpecifierVisitor`.
 */

describe('createSpecifierVisitor()', () => {
  it('should register a handler for each static import, re-export, and dynamic import node type', () => {
    const collected = [];
    const visitor = createSpecifierVisitor(source => collected.push(source.value));

    assert.deepEqual(Object.keys(visitor).sort(), [
      'ExportAllDeclaration',
      'ExportNamedDeclaration',
      'ImportDeclaration',
      'ImportExpression'
    ]);

    for (const visit of Object.values(visitor)) {
      visit({ source: { type: 'Literal', value: './x' } });
    }

    assert.deepEqual(collected, ['./x', './x', './x', './x']);
  });

  it('should ignore nodes without a string-literal source', () => {
    const collected = [];
    const visitor = createSpecifierVisitor(source => collected.push(source.value));
    const [visit] = Object.values(visitor);

    visit({ source: null });
    visit({ source: { name: 'mod', type: 'Identifier' } });
    visit({ source: { type: 'Literal', value: 42 } });

    assert.equal(collected.length, 0);
  });
});
