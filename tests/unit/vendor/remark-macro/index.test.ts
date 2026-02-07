import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import { VFile } from 'vfile';
import remarkParse from 'remark-parse';
import RemarkMacro from '../../../../src/vendor/remark-macro';

/**
 * Verifies the modern-path transformer preserves original markdown characters
 * (e.g., headings, emphasis) when passing the block body to a macro.
 */
describe('remark-macro modern transformer', () => {
  it('passes original markdown body (not plain text) to macro', async () => {
    const macro = RemarkMacro();
    // Echo macro returns the body it received for easy assertion
    macro.addMacro('ECHO', (body: string) => ({
      type: 'div',
      data: {
        hName: 'div',
        hChildren: [{ type: 'text', value: body }],
      },
    }));

    const md = [
      '[ECHO]',
      '## Heading',
      'Text with **bold** and a [link](https://example.com).',
      '[/ECHO]',
      '',
    ].join('\n');

    const processor = unified().use(remarkParse).use(macro.attacher);
    const tree = processor.parse(md);
    const file = new VFile({ value: md, path: 'sample.md' });
    const result = await processor.run(tree, file as any);

    // Find the replacement node (first top-level child)
    const node: any = (result as any).children[0];
    expect(node?.data?.hChildren?.[0]?.value).toContain('## Heading');
    expect(node?.data?.hChildren?.[0]?.value).toContain('**bold**');
    expect(node?.data?.hChildren?.[0]?.value).toContain('[link](https://example.com)');
  });

  it('consumes multi-line macro blocks and removes all covered nodes', async () => {
    const macro = RemarkMacro();
    // TOC macro replacement that returns a simple marker node
    macro.addMacro('toc', (_body: string) => ({
      type: 'TOCMacro',
      data: { hName: 'toc-macro' },
    }));

    const md = [
      '[toc]',
      '- [AAA](#AAA)',
      '- [BBB](#BBB)',
      '[/toc]',
      '',
      'Afterwards paragraph.',
    ].join('\n');

    const processor = unified().use(remarkParse).use(macro.attacher);
    const tree = processor.parse(md);
    const file = new VFile({ value: md, path: 'sample.md' });
    const result = await processor.run(tree, file as any);

    const children: any[] = (result as any).children;
    // First node should be our macro replacement
    expect(children[0]?.data?.hName).toBe('toc-macro');
    // Ensure the list and closing tag are not left behind; next node is the trailing paragraph
    expect(children[1]?.type).toBe('paragraph');
    expect(children[1]?.children?.[0]?.value).toContain('Afterwards paragraph.');
  });
});
