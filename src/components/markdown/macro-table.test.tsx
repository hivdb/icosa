import {render, screen} from '@testing-library/react';
import TableNodeWrapper, {
  buildColumnDefs,
  expandMultiCells,
  InlineParagraph,
  tableMacro
} from './macro-table';

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
    const built = buildColumnDefs(columnDefs, {renderers: {}}, '/cms');
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
    const Wrapper = TableNodeWrapper({tables, mdProps: {renderers: {}}});
    render(<Wrapper tableName="sample" compact lastCompact noHeaderOverlapping windowScroll />);
    expect(screen.getByText('v')).toBeTruthy();
    const Wrapper2 = TableNodeWrapper({tables: {}, mdProps: {renderers: {}}});
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
