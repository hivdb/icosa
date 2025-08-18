import { visit } from 'unist-util-visit';
import { parseProps, type MacroRegistry, type MacroHelpers, type BadMacroNode } from './types';

// Matches lines that start with optional two spaces, then [macroName props?]\n
const macroRegex = /^(\s{2})?\[(\w+)(.*)?\](?!\()\n?/;

function makeBadNode(ctx: any, message: string, ruleId?: string): BadMacroNode {
  return {
    type: 'BadMacroNode',
    props: {
      ruleId: ruleId || 'syntax-error',
      sourcePath: ctx?.file?.path,
    },
    data: {
      hName: 'div',
      hChildren: [
        {
          type: 'text',
          value: message,
        },
      ],
    },
  };
}

function linterFn(tree: any, file: any) {
  visit(tree, 'BadMacroNode', (node: any) => {
    const message = file.message(node.data.hChildren[0].value, node.position?.start);
    message.ruleId = node.props.ruleId;
    message.fatal = true;
    if (node.props.sourcePath) {
      message.name = message.name.replace(message.file, node.props.sourcePath);
      message.file = node.props.sourcePath;
    }
  });
}

function toKebab(input: string): string {
  return input
    // Handle consecutive capitals followed by a lowercase (e.g., TOCNode -> TOC-Node)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // Handle standard lower-to-upper boundaries
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function ensureHName(node: any) {
  if (!node || typeof node !== 'object') return node;
  const type = node.type;
  // If consumer didn't set an hName, infer a custom tag for react-markdown >= v6
  if (!node.data || !node.data.hName) {
    node.data = node.data || {};
    if (typeof type === 'string') {
      node.data.hName = `macro-${toKebab(type)}`;
    }
  }
  // Expose node fields as hProperties so components receive them as props
  const { children, type: _t, position: _p, data: _d, ...rest } = node;
  node.data.hProperties = { ...(node.data.hProperties || {}), ...rest };
  return node;
}

function processInline(eat: any, value: string, { $, macro, props }: any, helpers: MacroHelpers) {
  const propsHash = props ? parseProps(props) : {};
  const astNode = ensureHName(macro.fn(propsHash, helpers));
  // legacy eat API
  astNode ? eat($)(astNode) : eat($);
}

function processBlock(
  eat: any,
  value: string,
  { $, spaces, macroName, macro, props }: any,
  helpers: MacroHelpers,
) {
  let isClosed = false;
  const body: string[] = [];
  const children: string[] = [];
  const lines = value.split('\n');

  while (lines.length) {
    const line = String(lines.shift());
    body.push(line);
    if (`${line}` === `${spaces}[/${macroName}]`) {
      isClosed = true;
      break;
    }
    if (!line.startsWith(`${spaces}[${macroName}`)) {
      children.push(line.replace(spaces, ''));
    }
  }

  if (!isClosed) {
    eat($)(helpers.badNode(`Unclosed macro: ${macroName}`, 'unclosed-macro'));
    return;
  }

  const propsHash = props ? parseProps(props) : {};
  const astNode = ensureHName(macro.fn(children.join('\n'), propsHash, helpers));
  astNode ? eat(body.join('\n'))(astNode) : eat(body.join('\n'));
}

export default function RemarkMacro() {
  const macros: MacroRegistry = {};

  function transformNodes(this: any, eat: any, value: string, silent: boolean) {
    if (!value.trim().startsWith('[')) return;
    const match = macroRegex.exec(value);
    if (!match || match.index !== 0 || silent) return;

    const $ = match[0];
    const spaces = typeof match[1] === 'undefined' ? '' : match[1];
    const macroName = match[2].trim();
    const props = match[3];
    const macro = macros[macroName];
    if (!macro) return;

    const helpers: MacroHelpers = {
      transformer: this,
      eat,
      badNode: (msg: string, ruleId?: string) => makeBadNode(this, msg, ruleId),
      parseBlock: undefined, // only provided in modern path
    };

    if (macro.inline) return processInline(eat, value, { $, macro, props }, helpers);
    return processBlock(eat, value, { $, spaces, macroName, macro, props }, helpers);
  }

  function attacher(this: any) {
    // Legacy remark (react-markdown v4) path: patch Parser prototype
    const Parser = this.Parser as any;
    if (Parser && Parser.prototype && Parser.prototype.blockTokenizers) {
      const { blockMethods, blockTokenizers } = Parser.prototype;
      blockMethods.splice(blockMethods.indexOf('paragraph'), 0, 'macro');
      blockTokenizers.macro = transformNodes;
      return linterFn;
    }

    // Modern remark path: best-effort AST transform for paragraphs starting with macros
    return (tree: any, file: any) => {
      visit(tree, 'paragraph', (node: any, index?: number, parent?: any) => {
        if (!parent || typeof index !== 'number') return;
        const first = node.children?.[0];
        if (!first || first.type !== 'text') return;
        const value: string = String(first.value);
        if (!value.trim().startsWith('[')) return;
        const match = macroRegex.exec(value + '\n');
        if (!match || match.index !== 0) return;

        const $ = match[0];
        const spaces = typeof match[1] === 'undefined' ? '' : match[1];
        const macroName = match[2].trim();
        const props = match[3];
        const macro = macros[macroName];
        if (!macro) return;

        function toText(n: any): string {
          if (!n) return '';
          if (typeof n.value === 'string') return String(n.value);
          if (Array.isArray(n.children)) return n.children.map(toText).join('\n');
          return '';
        }
        const text = parent.children
          .slice(index)
          .map((n: any) => toText(n))
          .join('\n');

        const helpers: MacroHelpers = {
          badNode: (msg: string, ruleId?: string) => makeBadNode(this, msg, ruleId),
          parseBlock: (markdown: string) => {
            try {
              // Lazy import to avoid version mismatches at build time
              const { unified } = require('unified');
              const remarkParse = require('remark-parse');
              const root = unified().use(remarkParse).parse(markdown);
              return Array.isArray(root.children) ? root.children : [];
            } catch (_e) {
              return [];
            }
          },
        };

        // Use legacy processors to parse body bounds
        const eat = (consumed: string) => (replacement?: any) => {
          // Remove consumed paragraph(s) and insert replacement node
          // Best effort: assume single paragraph consumption here
          if (replacement) {
            parent.children.splice(index, 1, replacement);
          } else {
            parent.children.splice(index, 1);
          }
        };

        const legacyCtx = { file, Parser };
        return processBlock(eat, text, { $, spaces, macroName, macro, props }, helpers);
      });

      linterFn(tree, file);
    };
  }

  return {
    addMacro(name: string, fn: any, inline?: boolean) {
      if (macros[name]) throw new Error(`Cannot redefine the macro ${name}. One already exists`);
      if (typeof fn !== 'function') throw new Error('addMacro expects 2nd argument to be a function');
      macros[name] = { fn, inline: !!inline };
      return this;
    },
    /**
     * attacher compatible with both legacy and modern remark.
     * Kept under the name `transformer` as well for drop-in usage.
     */
    attacher,
    get transformer() {
      return attacher;
    },
  };
}
