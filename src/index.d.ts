import type { ESLint, Linter, Rule } from 'eslint';

/**
 * Options accepted by both rules. When omitted, the alias is auto-detected from the
 * nearest `package.json` `imports` field.
 */
export interface Options {
  /** The import alias prefix (e.g. `"#/"`). */
  prefix?: string;
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
