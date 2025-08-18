/**
 * Minimal vendored utilities and types for a remark macro plugin.
 *
 * This file provides:
 * - A light parser for macro props strings of the form: key="value", foo=1
 * - Shared TypeScript types used by the plugin implementation
 */

export interface BadMacroNodeData {
  hName: string;
  hChildren: Array<{ type: string; value: string }>;
}

export interface BadMacroNodeProps {
  ruleId?: string;
  sourcePath?: string;
}

export interface BadMacroNode {
  type: 'BadMacroNode';
  props: BadMacroNodeProps;
  data: BadMacroNodeData;
}

export interface MacroHelpers {
  /** Create a BadMacroNode with a message and optional rule id. */
  badNode: (message: string, ruleId?: string) => BadMacroNode;
  /** Parse inner markdown content into mdast children (best-effort shim). */
  parseBlock?: (markdown: string) => any[];
  /**
   * Legacy fields kept for compatibility; may be undefined in modern remark.
   * They are present when using the legacy tokenizer path.
   */
  transformer?: any;
  eat?: any;
}

export type MacroFn = (
  contentOrProps: any,
  propsOrHelpers?: Record<string, unknown>,
  helpers?: MacroHelpers,
) => any;

export interface MacroDef {
  fn: MacroFn;
  inline: boolean;
}

export type MacroRegistry = Record<string, MacroDef>;

/**
 * Parse a comma-separated list of key=value pairs possibly wrapped in quotes.
 *
 * Example: 'key="value", a=1, b = "two words"' -> { key: 'value', a: '1', b: 'two words' }
 */
export function parseProps(inString: string): Record<string, string> {
  const SPACE = 32, COMMA = 44, QUOTE = 34, EQUAL = 61;
  const chars = inString.split('');
  const result: Record<string, string> = {};
  const node: { key: string; value: string } = { key: '', value: '' };
  let prop: 'key' | 'value' = 'key';
  let underQuotes = false;
  let oldCharCode: number | '' = '';

  function consumeNode() {
    if (!node.key) return;
    result[node.key] = node.value;
    node.key = '';
    node.value = '';
  }

  while (chars.length) {
    const char = chars.shift() as string;
    const charCode = char.charCodeAt(0);

    if (charCode === QUOTE && (!chars[0] || [SPACE, COMMA].includes(chars[0].charCodeAt(0)))) {
      underQuotes = false;
    } else if (underQuotes) {
      node[prop] += char;
    } else if (charCode === QUOTE && [SPACE, EQUAL].includes(oldCharCode as number)) {
      underQuotes = true;
    } else if (charCode === SPACE) {
      // skip
    } else if (charCode === EQUAL) {
      prop = 'value';
    } else if (charCode === COMMA) {
      prop = 'key';
      consumeNode();
    } else {
      node[prop] += char;
    }

    oldCharCode = charCode;
  }

  consumeNode();
  return result;
}

