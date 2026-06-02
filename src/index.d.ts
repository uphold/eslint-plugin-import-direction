import type { ESLint, Linter, Rule } from 'eslint';

/**
 * Options accepted by both rules. When omitted, the alias is auto-detected from the
 * nearest `package.json` `imports` field.
 */
export interface Options {
  /** The import alias prefix (e.g. `"#/"`). */
  aliasPrefix?: string;
  /**
   * Glob patterns (relative to the alias root, in posix form) marking module-root
   * directories. Relative imports that stay within the same module root are allowed
   * instead of requiring the alias.
   */
  moduleRoots?: string[];
  /** Absolute path the alias prefix maps to. */
  rootDir?: string;
}

declare const plugin: ESLint.Plugin & {
  meta: { name: string; version: string };
  rules: {
    'no-aliased-local': Rule.RuleModule;
    'no-relative-parent': Rule.RuleModule;
  };
  configs: {
    recommended: Linter.Config;
  };
};

export default plugin;
