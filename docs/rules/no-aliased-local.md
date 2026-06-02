# Disallow aliased imports for files within the same directory subtree in favor of relative imports (`@uphold/import-direction/no-aliased-local`)

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Aliased imports that point at a file in the importing file's own directory or a subdirectory of it must instead use a relative specifier (`./`). Aliased imports that point at an ancestor are left untouched.

## Examples

Examples of **incorrect** code for this rule (file `src/shared/errors/index.ts`, alias `"#/*": "./*"`):

```js
import { BaseError } from '#/src/shared/errors/base.ts';

export { ConflictError } from '#/src/shared/errors/conflict.ts';
```

Examples of **correct** code:

```js
import { BaseError } from './base.ts';

export { ConflictError } from './conflict.ts';

// An alias pointing at an ancestor is fine.
import type { Config } from '#/config/types.ts';
```

### Module roots

When `moduleRoots` marks a directory as a module root, an alias that points at a file
within the same module root is rewritten to a relative import — even when it sits in a
sibling directory rather than a subtree (file `src/repositories/processes/create.ts`,
option `{ moduleRoots: ['src/repositories'] }`):

```js
// ❌ resolves within the src/repositories module root
import { getDb } from '#/src/repositories/utils/db-options.ts';

// ✅ rewritten to the relative form
import { getDb } from '../utils/db-options.ts';

// An alias pointing outside the module root is still fine.
import type { Config } from '#/config/types.ts';
```

## Options

<!-- begin auto-generated rule options list -->

| Name          | Description                                                                                                                                                                          | Type     |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `aliasPrefix` | The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports".                                                                               | String   |
| `moduleRoots` | Glob patterns (relative to the alias root, in posix form) marking module-root directories. Aliased imports to a file within the same module root are rewritten to a relative import. | String[] |
| `rootDir`     | Absolute path the alias prefix maps to. Overrides auto-detection.                                                                                                                    | String   |

<!-- end auto-generated rule options list -->
