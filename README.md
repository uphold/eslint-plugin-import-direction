# @uphold/eslint-plugin-import-direction

An ESLint plugin that enforces **import direction**:

- **Ancestor** imports (anything that would traverse `../`) must use a root **alias**.
- **Sibling and descendant** imports (same directory or below) must stay **relative** (`./`).

The alias is read straight from your `package.json` [`imports`](https://nodejs.org/api/packages.html#subpath-imports) field (e.g. `"#/*": "./*"`), so it works with Node subpath imports — no `tsconfig` paths or bundler required.

## Installation

```sh
npm install --save-dev @uphold/eslint-plugin-import-direction
```

Then declare the alias once in your `package.json`:

```json
{
  "imports": {
    "#/*": "./*"
  }
}
```

## Usage

Flat config (`eslint.config.js`) — enable the `recommended` preset:

```js
import importDirection from '@uphold/eslint-plugin-import-direction';

export default [importDirection.configs.recommended];
```

Or register the plugin and pick rules explicitly:

```js
import importDirection from '@uphold/eslint-plugin-import-direction';

export default [
  {
    plugins: { '@uphold/import-direction': importDirection },
    rules: {
      '@uphold/import-direction/no-relative-parent': 'error',
      '@uphold/import-direction/no-aliased-local': 'error'
    }
  }
];
```

Both rules are autofixable, so `eslint . --fix` migrates an existing codebase in one pass.

## Configuration

By default the alias prefix and root directory are auto-detected from the nearest `package.json` `imports` field. To override (or for setups without an `imports` field), pass options to either rule:

```js
'@uphold/import-direction/no-relative-parent': ['error', { aliasPrefix: '#/', rootDir: import.meta.dirname }]
```

| Option | Type | Description |
| --- | --- | --- |
| `aliasPrefix` | `string` | The import alias prefix, e.g. `"#/"`. |
| `rootDir` | `string` | Absolute path the alias prefix maps to. |
| `moduleRoots` | `string[]` | Glob patterns marking module-root directories. See below. |

### Module roots

By default the alias is required for _any_ import that traverses `../`, even between two
files in the same cohesive sub-module. For example, with the file
`src/repositories/processes/create.ts` importing a sibling utility:

```js
// ❌ forced by default
import { getDb } from '#/src/repositories/utils/db-options.ts';
```

`moduleRoots` lets you mark directories as **module roots** (glob patterns matched against
the directory path relative to the alias root, in posix form). Imports that stay within
the same module root are then treated like local imports — kept relative rather than
aliased:

```js
'@uphold/import-direction/no-relative-parent': ['error', { moduleRoots: ['src/repositories'] }]
```

```js
// ✅ allowed, because both files live under the src/repositories module root
import { getDb } from '../utils/db-options.ts';
```

The direction philosophy still holds across module boundaries: a `../` import that leaves
its module root must use the alias. With `no-aliased-local`, an alias pointing at a file
within the same module root is rewritten to the relative form.

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                   | Description                                                                                       | 💼 | 🔧 |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :- | :- |
| [no-aliased-local](docs/rules/no-aliased-local.md)     | Disallow aliased imports for files within the same directory subtree in favor of relative imports | ✅  | 🔧 |
| [no-relative-parent](docs/rules/no-relative-parent.md) | Disallow relative parent imports in favor of the configured root alias                            | ✅  | 🔧 |

<!-- end auto-generated rules list -->

## License

[MIT](./LICENSE)
