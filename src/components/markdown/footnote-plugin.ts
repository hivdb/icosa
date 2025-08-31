import { visit } from 'unist-util-visit';
import type {Node, Parent} from 'unist';

type HData = {hName?: string; hProperties?: Record<string, unknown>} & Record<string, unknown>;
type MutableNode = Node & {type?: string; data?: HData; children?: Node[]; value?: unknown; label?: string; identifier?: string};
type MutableParent = Parent & {type?: string; children: Node[]};

/**
 * remark plugin that transforms GFM footnote references (e.g. `[^Abe21]` or
 * `[^Abe21#inline]`) into custom elements understood by react-markdown.
 *
 * It replaces `footnoteReference` nodes with an element named `ref-link` and
 * passes the original identifier via `hProperties.identifier`. Our `RefLink`
 * component consumes this and either renders a popup citation link or, when the
 * identifier ends with `#inline`, an inline reference expansion.
 */
export default function footnoteReferencePlugin() {
  return function transformer(tree: Node) {
    // Convert GFM footnoteReference nodes to our ref-link elements
    visit(tree, 'footnoteReference', (node: Node) => {
      const n = node as MutableNode;
      const id: string = String(n.label || n.identifier || '');
      n.type = 'refLinkNode';
      n.data = n.data || {};
      n.data.hName = 'ref-link';
      n.data.hProperties = {
        ...(n.data.hProperties || {}),
        identifier: id
      };
      delete n.children;
    });

    // Thorough inline transform: split text nodes across the entire tree
    // to replace [^id] with a ref-link node, while avoiding code/link nodes.
    visit(tree, (node: Node) => node && typeof (node as MutableNode).type === 'string', (node: Node, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return;
      const n = node as MutableNode;
      if (n.type !== 'text') return;
      // Skip if any ancestor is code or link-like
      const parentType = (parent as MutableParent).type || '';
      if (parentType === 'link' || parentType === 'inlineCode' || parentType === 'code') return;
      const value: string = String(n.value || '');
      if (!value || value.indexOf('[^') === -1) return;

      const out: Node[] = [];
      const re = /\[\^([^\]\s]+)\]/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(value)) !== null) {
        const start = m.index;
        const raw = m[0];
        const id = m[1];
        if (start > last) out.push({ type: 'text', value: value.slice(last, start) } as Node);
        out.push({ type: 'refLinkNode', data: { hName: 'ref-link', hProperties: { identifier: id } } } as Node);
        last = start + raw.length;
      }
      if (out.length > 0) {
        if (last < value.length) out.push({ type: 'text', value: value.slice(last) } as Node);
        (parent as MutableParent).children.splice(index, 1, ...out);
        return index + out.length;
      }
    });
  };
}
