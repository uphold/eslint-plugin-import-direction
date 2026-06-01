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

## Options

<!-- begin auto-generated rule options list -->

| Name      | Description                                                                                            | Type   |
| :-------- | :----------------------------------------------------------------------------------------------------- | :----- |
| `prefix`  | The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports". | String |
| `rootDir` | Absolute path the alias prefix maps to. Overrides auto-detection.                                      | String |

<!-- end auto-generated rule options list -->
