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
  const config = { base: '/repo', prefix: '#/' };

  it('should require the alias for a parent import that resolves inside the base', () => {
    assert.equal(resolveRequiredForm('../x.ts', '/repo/src/a', config), '#/src/x.ts');
    assert.equal(resolveRequiredForm('../../config/types.ts', '/repo/src/a', config), '#/config/types.ts');
  });

  it('should return null for a parent import that resolves outside the base', () => {
    assert.equal(resolveRequiredForm('../outside.ts', '/repo', config), null);
  });

  it('should require a relative specifier for an aliased import in the same subtree', () => {
    assert.equal(resolveRequiredForm('#/src/a/x.ts', '/repo/src/a', config), './x.ts');
    assert.equal(resolveRequiredForm('#/src/a/sub/x.ts', '/repo/src/a', config), './sub/x.ts');
  });

  it('should keep an aliased import that points to an ancestor inside the base', () => {
    assert.equal(resolveRequiredForm('#/config/types.ts', '/repo/src/a', config), '#/config/types.ts');
  });

  it('should keep a relative import that stays within the subtree', () => {
    assert.equal(resolveRequiredForm('./x.ts', '/repo/src/a', config), './x.ts');
    assert.equal(resolveRequiredForm('./sub/x.ts', '/repo/src/a', config), './sub/x.ts');
  });

  it('should resolve aliases mapped to a subdirectory base', () => {
    const subConfig = { base: '/repo/src', prefix: '#/' };

    assert.equal(resolveRequiredForm('../x.ts', '/repo/src/a', subConfig), '#/x.ts');
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
