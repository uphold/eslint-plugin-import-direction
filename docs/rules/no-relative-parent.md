# Disallow relative parent imports in favor of the configured root alias (`@uphold/import-direction/no-relative-parent`)

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Imports that traverse into a parent directory (`../`) must instead use the root alias resolved from your `package.json` `imports` field.

## Examples

Examples of **incorrect** code for this rule (file `src/shared/connectrpc/error-interceptor.ts`, alias `"#/*": "./*"`):

```js
import { BaseError } from '../errors/index.ts';
import type { Config } from '../../config/types.ts';

const db = await import('../../clients/kysely/index.ts');
```

Examples of **correct** code:

```js
import { BaseError } from '#/src/shared/errors/index.ts';
import type { Config } from '#/config/types.ts';

const db = await import('#/src/shared/clients/kysely/index.ts');
```

### Module roots

When `moduleRoots` marks a directory as a module root, relative parent imports that stay
within that module root are allowed (file `src/repositories/processes/create.ts`, option
`{ moduleRoots: ['src/repositories'] }`):

```js
// ✅ both files live under the src/repositories module root
import { getDb } from '../utils/db-options.ts';

// ❌ this import leaves the module root, so the alias is still required
import type { Config } from '../../config/types.ts';
```

## Options

<!-- begin auto-generated rule options list -->

| Name          | Description                                                                                                                                                                                          | Type     |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `aliasPrefix` | The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports".                                                                                               | String   |
| `moduleRoots` | Glob patterns (relative to the alias root, in posix form) marking module-root directories. Relative parent imports that stay within the same module root are allowed instead of requiring the alias. | String[] |
| `rootDir`     | Absolute path the alias prefix maps to. Overrides auto-detection.                                                                                                                                    | String   |

<!-- end auto-generated rule options list -->
