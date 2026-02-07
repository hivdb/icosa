import {describe, it, expect} from 'vitest';
import type {PresetColumnDef, MDRow} from '../../../../src/components/markdown/types';
import {render, screen} from '@testing-library/react';
import TableNodeWrapper, {
  buildColumnDefs,
  expandMultiCells,
  InlineParagraph,
  tableMacro
} from '../../../../src/components/markdown/macro-table';

describe('macro-table utilities', () => {
  it('builds columns and expands data', () => {
    const columnDefs = [
      {name: 'c1', label: 'Col\n1'},
      {name: 'c2', render: 'nl2br'},
      {name: 'c3', render: 'join'},
      {name: 'c4', render: 'articleList', sort: 'articleList'},
      {name: 'c5', render: 'compoundEC50Obj'},
      {name: 'c6', render: 'nowrap'},
      {name: 'c7', render: 'checkMark', sort: 'numeric'},
      {name: 'c8', renderTpl: '{{it.value}}'}
    ];
    const built = buildColumnDefs(columnDefs, {components: {}}, '/cms');
    const row = {
      c1: 'a\nb',
      c2: 'x\ny',
      c3: ['a', 'b'],
      c4: [{doi: '10', firstAuthor: {surname: 'Foo'}, year: 2020, journal: 'J'}],
      c5: [{name: 'Drug', ec50: '1', ec50Note: 'note'}],
      c6: 'nowrap',
      c7: true,
      c8: {value: 'T'}
    };
    built[0].render(row.c1, row, {}, {});
    built[0].render(5, row, {}, {});
    built[1].render(row.c2, row, {}, {});
    built[1].render(42, row, {}, {});
    built[2].render(row.c3, row, {}, {joinBy: ', '});
    built[2].render(undefined, row, {}, {joinBy: ', '});
    built[3].render(row.c4, row, {}, {});
    built[3].render([{doi: '10', firstAuthor: {surname: 'Foo'}, year: 2020, journal: 'J', journalShort: 'Jr'}], row, {}, {});
    built[3].render([{freeText: 'free'}], row, {}, {});
    built[4].render(row.c5, row, {}, {});
    built[4].render([{name: 'Drug', ec50: '2'}], row, {}, {});
    built[4].render('invalid' as any, row, {}, {});
    built[5].render(row.c6, row, {}, {});
    built[6].render(row.c7, row, {}, {});
    built[6].render(false, row, {}, {});
    built[7].render(row.c8, row, {}, {});
    built[3].sort?.([{references: [{firstAuthor: {surname: 'B'}, year: 2020}]}], 'references');
    built[6].sort?.([{c7: '2'}, {c7: '1'}], 'c7');
    const expanded = expandMultiCells([{cells: [{v:1}, {v:2}], other: 'x'}], [{name: 'cells', multiCells: true}]);
    expect(expanded).toHaveLength(2);
    expect(() => expandMultiCells([{a: [1]}, {b: [1]}], [{name:'a', multiCells:true}, {name:'b', multiCells:true}])).toThrow();
  });
});

describe('TableNodeWrapper', () => {
  it('renders table data or error message', () => {
    const tables = {sample: {columnDefs: [{name: 'c1'}], data: [{c1: 'v'}], references: ''}};
    const Wrapper = TableNodeWrapper({tables, mdProps: {components: {}}});
    render(<Wrapper tableName="sample" compact lastCompact noHeaderOverlapping windowScroll />);
    expect(screen.getByText('v')).toBeTruthy();
    const Wrapper2 = TableNodeWrapper({tables: {}, mdProps: {components: {}}});
    render(<Wrapper2 tableName="missing" />);
    expect(screen.getByText(/table data of missing is not found/)).toBeTruthy();
  });

  it('renders InlineParagraph without wrapper', () => {
    const {container} = render(<InlineParagraph>text</InlineParagraph>);
    expect(container.textContent).toBe('text');
    expect(container.querySelector('p')).toBeNull();
  });

  it('builds TableNode from macro handler', () => {
    expect(tableMacro(' name ', {foo: 1})).toEqual({
      foo: 1,
      type: 'TableNode',
      tableName: 'name'
    });
  });
});

describe('macro-table typing helpers', () => {
  it('buildColumnDefs returns ColumnDef array with working renderers', () => {
    const preset: PresetColumnDef[] = [
      {name: 'a', label: 'A'},
      {name: 'b', renderTpl: 'val=${cellData}'}
    ];
    const colDefs = buildColumnDefs(preset, {components: {}}, '/cms');
    expect(colDefs).toHaveLength(2);
    const row: MDRow = {a: 'x', b: 3};
    const rendered = colDefs[1].render(3, row, {}, {});
    // renderTpl returns a React element, so render it and check text content
    const {container} = render(<div>{rendered}</div>);
    expect(container.textContent).toContain('val=3');
  });

  it('expandMultiCells expands rows on a single multiCells column', () => {
    const preset: PresetColumnDef[] = [
      {name: 'items', multiCells: true},
      {name: 'label'}
    ];
    const colDefs = buildColumnDefs(preset, {components: {}}, undefined);
    const data: MDRow[] = [{items: [1, 2], label: 'x'}];
    const expanded = expandMultiCells(data, colDefs);
    expect(expanded).toHaveLength(2);
    expect((expanded[0] as any).items).toBe(1);
    expect((expanded[1] as any).items).toBe(2);
  });
});

