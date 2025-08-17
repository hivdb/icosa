import {describe, it, expect, vi} from 'vitest';

import ColumnDef, {createUnsafeRenderFromTpl} from './column-def';

describe('ColumnDef', () => {
  it('creates renderer from template and decorator', () => {
    const col = new ColumnDef({
      name: 'greet',
      renderTpl: '${cellData}!',
      decorator: (v: string) => v.toUpperCase()
    });
    const output = col.render('hi', {}, {}, {});
    expect(output).toBe('HI!');
  });

  it('sorts using decorator by default', () => {
    const col = new ColumnDef({name: 'n', decorator: (v: number) => -v});
    const rows = [{n: 2}, {n: 1}];
    const sorted = col.sort(rows, 'n');
    expect(sorted.map(r => r.n)).toEqual([2, 1]);
  });

  it('creates render function from unsafe template', () => {
    const fn = createUnsafeRenderFromTpl('Hello ${cellData}');
    expect(fn('World', {}, {}, {})).toBe('Hello World');
  });

  it('escapes html when requested', () => {
    const fn = createUnsafeRenderFromTpl('<b>${cellData}</b>', true);
    expect(fn('<script>', {}, {}, {})).toBe('<b>&lt;script&gt;</b>');
  });

  it('supports exportRaw and array sort keys', () => {
    const col = new ColumnDef({
      name: 'obj',
      exportRaw: true,
      decorator: (v: number) => v * 2,
      sort: ['k']
    });
    const rows = [{obj: {k: 2}}, {obj: {k: 1}}];
    const cell = col.exportCell!(1, {obj: 1});
    expect(cell).toBe(2);
    const sorted = col.sort(rows, 'obj');
    expect(sorted[0].obj.k).toBe(1);
  });

  it('handles empty values and custom sort', () => {
    const sortFn = vi.fn(rows => rows);
    const col = new ColumnDef({
      name: 'n',
      none: 'N/A',
      sort: sortFn
    });
    expect(col.render('', {}, {}, {})).toBe('N/A');
    col.sort([{n: 1}], 'n');
    expect(sortFn).toHaveBeenCalled();
  });
});
