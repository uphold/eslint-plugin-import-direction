/**
 * Module dependencies.
 */

import { RuleTester } from 'eslint';
import rule from './no-aliased-local.js';
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
 * Test `no-aliased-local` rule.
 */

ruleTester.run('no-aliased-local', rule, {
  invalid: [
    {
      code: `import x from '#/src/shared/errors/base.ts';`,
      errors: [{ messageId: 'useRelative' }],
      filename: '/repo/src/shared/errors/index.ts',
      options,
      output: `import x from './base.ts';`
    },
    {
      code: `import x from "#/src/shared/errors/base.ts";`,
      errors: [{ messageId: 'useRelative' }],
      filename: '/repo/src/shared/errors/index.ts',
      options,
      output: `import x from "./base.ts";`
    },
    {
      code: `import x from '#/apps/rpc-server/services/business.ts';`,
      errors: [{ messageId: 'useRelative' }],
      filename: '/repo/apps/rpc-server/app.ts',
      options,
      output: `import x from './services/business.ts';`
    },
    {
      code: `const p = import('#/src/shared/errors/base.ts');`,
      errors: [{ messageId: 'useRelative' }],
      filename: '/repo/src/shared/errors/index.ts',
      options,
      output: `const p = import('./base.ts');`
    },
    {
      code: `export { base } from '#/src/shared/errors/base.ts';`,
      errors: [{ messageId: 'useRelative' }],
      filename: '/repo/src/shared/errors/index.ts',
      options,
      output: `export { base } from './base.ts';`
    },
    {
      code: `import x from '#/src/repositories/utils/db-options.ts';`,
      errors: [{ messageId: 'useRelative' }],
      filename: '/repo/src/repositories/processes/create.ts',
      options: moduleOptions,
      output: `import x from '../utils/db-options.ts';`
    }
  ],
  valid: [
    { code: `import x from './base.ts';`, filename: '/repo/src/shared/errors/index.ts', options },
    { code: `import x from '#/config/types.ts';`, filename: '/repo/src/a/b.ts', options },
    { code: `import x from '../x.ts';`, filename: '/repo/src/a/b/c.ts', options },
    { code: `import x from 'lodash';`, filename: '/repo/src/a/b.ts', options },
    {
      code: `import x from '#/config/types.ts';`,
      filename: '/repo/src/repositories/processes/create.ts',
      options: moduleOptions
    }
  ]
});
