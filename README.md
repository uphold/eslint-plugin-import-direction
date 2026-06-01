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

By default the alias `prefix` and root directory are auto-detected from the nearest `package.json` `imports` field. To override (or for setups without an `imports` field), pass options to either rule:

```js
'@uphold/import-direction/no-relative-parent': ['error', { prefix: '#/', rootDir: import.meta.dirname }]
```

| Option | Type | Description |
| --- | --- | --- |
| `prefix` | `string` | The import alias prefix, e.g. `"#/"`. |
| `rootDir` | `string` | Absolute path the alias prefix maps to. |

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
