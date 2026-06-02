/**
 * Module dependencies.
 */

import { RuleTester } from 'eslint';
import rule from './no-relative-parent.js';
import tseslint from 'typescript-eslint';

/**
 * Test setup.
 */

const options = [{ aliasPrefix: '#/', rootDir: '/repo' }];
const moduleOptions = [{ aliasPrefix: '#/', moduleRoots: ['src/repositories'], rootDir: '/repo' }];
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    parser: tseslint.parser,
    sourceType: 'module'
  }
});

/**
 * Test `no-relative-parent` rule.
 */

ruleTester.run('no-relative-parent', rule, {
  invalid: [
    {
      code: `import x from '../errors/index.ts';`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/shared/connectrpc/e.ts',
      options,
      output: `import x from '#/src/shared/errors/index.ts';`
    },
    {
      code: `import x from "../errors/index.ts";`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/shared/connectrpc/e.ts',
      options,
      output: `import x from "#/src/shared/errors/index.ts";`
    },
    {
      code: `import type { T } from '../../config/types.ts';`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/a/b.ts',
      options,
      output: `import type { T } from '#/config/types.ts';`
    },
    {
      code: `const p = import('../x.ts');`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/a/b/c.ts',
      options,
      output: `const p = import('#/src/a/x.ts');`
    },
    {
      code: `export { x } from '../x.ts';`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/a/b/c.ts',
      options,
      output: `export { x } from '#/src/a/x.ts';`
    },
    {
      code: `export * from '../x.ts';`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/a/b/c.ts',
      options,
      output: `export * from '#/src/a/x.ts';`
    },
    {
      code: `import x from '../outside.ts';`,
      errors: [{ messageId: 'noAlias' }],
      filename: '/repo/a.ts',
      options,
      output: null
    },
    {
      code: `import x from '../../shared/x.ts';`,
      errors: [{ messageId: 'useAlias' }],
      filename: '/repo/src/repositories/processes/create.ts',
      options: moduleOptions,
      output: `import x from '#/src/shared/x.ts';`
    }
  ],
  valid: [
    { code: `import x from './foo.ts';`, filename: '/repo/src/a/b.ts', options },
    { code: `import x from './sub/foo.ts';`, filename: '/repo/src/a/b.ts', options },
    { code: `import x from '#/config/types.ts';`, filename: '/repo/src/a/b.ts', options },
    { code: `import x from 'lodash';`, filename: '/repo/src/a/b.ts', options },
    { code: `const p = import('node:fs');`, filename: '/repo/src/a/b.ts', options },
    { code: `import x from '../foo.ts';`, filename: '/repo/src/a/b.ts' },
    {
      code: `import x from '../utils/db-options.ts';`,
      filename: '/repo/src/repositories/processes/create.ts',
      options: moduleOptions
    }
  ]
});
