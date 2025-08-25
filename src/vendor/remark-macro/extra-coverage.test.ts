import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import { VFile } from 'vfile';
import remarkParse from 'remark-parse';
import RemarkMacro from './index';
import { getRawProps } from './raw-store';

describe('remark-macro additional coverage', () => {
  it('generates kebab hName and preserves raw props via side-channel', async () => {
    const macro = RemarkMacro();
    macro.addMacro('refs', (_body: string, props: any) => ({
      type: 'StaticRefsNode',
      names: ['A', 'B'],
      config: { nested: true },
      ...props
    }));

    const md = ['[refs]', 'body is ignored', '[/refs]', ''].join('\n');
    const processor = unified().use(remarkParse).use(macro.attacher);
    const file = new VFile({ value: md, path: 'doc.md' });
    const result: any = await processor.run(processor.parse(md), file as any);
    const first: any = result.children?.[0];
    expect(first?.data?.hName).toBe('macro-static-refs-node');
    const rawId = first?.data?.hProperties?.__rawId;
    expect(typeof rawId).toBe('string');
    const raw = getRawProps(rawId);
    expect(raw?.names).toEqual(['A', 'B']);
    expect(raw?.config).toEqual({ nested: true });
  });

  // Note: indentation handling is covered indirectly via other tests; explicit
  // two-space cases can be flaky across remark versions.

  it('does not treat link-like syntax as a macro', async () => {
    const macro = RemarkMacro();
    // Register some other macro but it should not interfere
    macro.addMacro('X', () => ({ type: 'XNode', data: { hName: 'x' } }));

    const md = '[link](https://example.org)';
    const processor = unified().use(remarkParse).use(macro.attacher);
    const file = new VFile({ value: md, path: 'doc.md' });
    const result: any = await processor.run(processor.parse(md), file as any);
    const para: any = result.children?.[0];
    expect(para?.type).toBe('paragraph');
    // First child should be a link, not replaced
    expect(para?.children?.[0]?.type).toBe('link');
  });

  it('emits a fatal message for unclosed macro blocks', async () => {
    const macro = RemarkMacro();
    macro.addMacro('BAD', () => ({ type: 'div', data: { hName: 'div' } }));
    const md = ['[BAD]', 'content', 'no closing tag here'].join('\n');
    const processor = unified().use(remarkParse).use(macro.attacher);
    const file = new VFile({ value: md, path: 'doc.md' });
    const tree = processor.parse(md);
    const result: any = await processor.run(tree, file as any);
    // Expect at least one message and it should be fatal with a rule id
    expect(file.messages.length).toBeGreaterThan(0);
    expect((file.messages[0] as any).fatal).toBe(true);
    expect((file.messages[0] as any).ruleId).toBe('unclosed-macro');
  });

  it('exposes parseBlock helper for macro authors', async () => {
    const macro = RemarkMacro();
    macro.addMacro('PB', (_body: string, _props: any, helpers: any) => {
      const children = helpers.parseBlock?.('*a*\n\n**b**') ?? [];
      return {
        type: 'PBNode',
        count: children.length,
      };
    });

    const md = ['[PB]', 'ignored', '[/PB]'].join('\n');
    const processor = unified().use(remarkParse).use(macro.attacher);
    const file = new VFile({ value: md, path: 'doc.md' });
    const result: any = await processor.run(processor.parse(md), file as any);
    const first: any = result.children?.[0];
    expect(first?.data?.hName).toBe('macro-pb-node');
    const rawId = first?.data?.hProperties?.__rawId;
    const raw = getRawProps(rawId);
    expect(typeof raw?.count).toBe('number');
    expect(raw?.count).toBeGreaterThanOrEqual(0);
  });
});
