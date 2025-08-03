import {describe, it, expect} from 'vitest';

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
});
