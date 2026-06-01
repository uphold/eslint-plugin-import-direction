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

## Options

<!-- begin auto-generated rule options list -->

| Name      | Description                                                                                            | Type   |
| :-------- | :----------------------------------------------------------------------------------------------------- | :----- |
| `prefix`  | The import alias prefix (e.g. "#/"). Overrides auto-detection from the nearest package.json "imports". | String |
| `rootDir` | Absolute path the alias prefix maps to. Overrides auto-detection.                                      | String |

<!-- end auto-generated rule options list -->
