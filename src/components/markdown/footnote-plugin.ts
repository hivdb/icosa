import { visit } from 'unist-util-visit';

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
  return function transformer(tree: any) {
    // Convert GFM footnoteReference nodes to our ref-link elements
    visit(tree, 'footnoteReference', (node: any) => {
      const id: string = (node.label || node.identifier || '').toString();
      node.type = 'refLinkNode';
      node.data = node.data || {};
      node.data.hName = 'ref-link';
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        identifier: id
      };
      delete node.children;
    });

    // Thorough inline transform: split text nodes across the entire tree
    // to replace [^id] with a ref-link node, while avoiding code/link nodes.
    visit(tree, (node: any) => node && typeof node.type === 'string', (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== 'number') return;
      if (node.type !== 'text') return;
      // Skip if any ancestor is code or link-like
      const parentType = parent.type || '';
      if (parentType === 'link' || parentType === 'inlineCode' || parentType === 'code') return;
      const value: string = String(node.value || '');
      if (!value || value.indexOf('[^') === -1) return;

      const out: any[] = [];
      const re = /\[\^([^\]\s]+)\]/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(value)) !== null) {
        const start = m.index;
        const raw = m[0];
        const id = m[1];
        if (start > last) out.push({ type: 'text', value: value.slice(last, start) });
        out.push({ type: 'refLinkNode', data: { hName: 'ref-link', hProperties: { identifier: id } } });
        last = start + raw.length;
      }
      if (out.length > 0) {
        if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
        parent.children.splice(index, 1, ...out);
        return index + out.length;
      }
    });
  };
}
