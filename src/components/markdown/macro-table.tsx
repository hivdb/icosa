import React from 'react';
import toPath from 'lodash/toPath';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import ReactMarkdown from 'react-markdown';

import macroPlugin from './macro-plugin';
import SimpleTable, {ColumnDef} from '../simple-table';
import {createUnsafeRenderFromTpl} from '../simple-table/column-def';

import style from './style.module.scss';

/**
 * Macro handler converting `table` directives into {@link TableNode} objects.
 *
 * @param content - Inner text of the macro indicating the table name.
 * @param props - Additional properties defined on the macro tag.
 * @returns AST node consumed by {@link TableNodeWrapper}.
 */
export function tableMacro(content: string, props: Record<string, unknown>) {
  return {
    ...props,
    type: 'TableNode',
    tableName: content.trim()
  } as const;
}

macroPlugin.addMacro('table', tableMacro);

/**
 * Convert new line characters to `<br/>` in markdown text.
 *
 * @param text - Input string potentially containing newlines.
 * @returns Text with single newlines converted to markdown line breaks.
 */
function nl2brMdText(text: unknown) {
  if (typeof text === 'string') {
    return text.replace(/([^\n]|^)\n(?!\n)/g, '$1  \n');
  }
  return text;
}

/**
 * Default renderer used for table cell values. It also replaces `CMS_PREFIX`
 * placeholders in strings and renders markdown when appropriate.
 *
 * @param mdProps - Props forwarded to the markdown renderer.
 * @param cmsPrefix - Optional CMS prefix used to replace placeholders.
 * @returns A function converting cell values to React nodes.
 */
function defaultRenderer(mdProps: any, cmsPrefix?: string) {
  return (value: any) => {
    if (typeof value === 'string') {
      value = value.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix ?? '');
      return <ReactMarkdown {...mdProps}>{value}</ReactMarkdown>;
    }
    return value;
  };
}

/**
 * A collection of supported render functions referenced by string name in
 * table column definitions.
 */
const renderFuncs: Record<string, any> = {
  default: defaultRenderer,
    template: (tpl: string, mdProps: any, cmsPrefix?: string) => {
      const renderTpl = createUnsafeRenderFromTpl(tpl, true) as (...args: any[]) => any;
      return (...args: any[]) => defaultRenderer(mdProps, cmsPrefix)(renderTpl(...args));
    },
  nl2br(mdProps: any, cmsPrefix?: string) {
    return (value: any) => defaultRenderer(mdProps, cmsPrefix)(nl2brMdText(value));
  },
  join(mdProps: any, cmsPrefix?: string) {
    return (value: any[], _row: any, _context: any, {joinBy = ''}: {joinBy?: string}) => {
      if (!value) {
        return null;
      }
      return defaultRenderer(mdProps, cmsPrefix)(value.join(joinBy));
    };
  },
  articleList(mdProps: any, cmsPrefix?: string) {
    const freeTextRenderer = defaultRenderer(mdProps, cmsPrefix);
    return (articles: any[]) => (<>
      {articles.map(({
        doi,
        firstAuthor: {surname} = {},
        year,
        journal,
        journalShort,
        freeText
      }, idx) => (
        <div key={idx}>
          {freeText ?
            freeTextRenderer(freeText) : <>
              <a
                href={`https://doi.org/${doi}`}
                rel="noopener noreferrer"
                target="_blank">
                {surname} {year}
              </a>{' '}({journalShort ? journalShort : journal})
            </>}
        </div>
      ))}
    </>);
  },
  compoundEC50Obj(mdProps: any, cmsPrefix?: string) {
    const freeTextRenderer = defaultRenderer(mdProps, cmsPrefix);
    return (compounds: any) => {
      if (!(compounds instanceof Array)) {
        compounds = [];
      }
      const content = compounds.map(({name, ec50, ec50Note}: any) => {
        const part = [`${name}`];
        if (ec50 && ec50Note) {
          part.push(` (${ec50}, ${ec50Note})`);
        }
        else if (ec50) {
          part.push(` (${ec50})`);
        }
        return `${part.join('')}  `;
      }).join('\n');
      return freeTextRenderer(content);
    };
  },
  nowrap(mdProps: any, cmsPrefix?: string) {
    return (value: any) => <span className={style.nowrap}>
      {defaultRenderer(mdProps, cmsPrefix)(value)}
    </span>;
  },
  checkMark() {
    return (value: any) => value ? '\u2713' : '';
  }
};

/** Sorting helper functions referenced by string name. */
const sortFuncs: Record<string, any> = {
  articleList: (rows: any[]) => sortBy(rows, ({references}: any) =>
    references.map(({firstAuthor: {surname} = [], year}: any) => [surname, -year])
  ),
  numeric: (rows: any[], column: string) => sortBy(
    rows,
    row => parseInt(nestedGet(row, column))
  )
};

/**
 * Build ColumnDef objects from plain definitions provided in table presets.
 *
 * @param columnDefs - Column definitions from table presets.
 * @param mdProps - Markdown rendering props.
 * @param cmsPrefix - Optional CMS prefix.
 * @returns Array of {@link ColumnDef} objects.
 */
export function buildColumnDefs(columnDefs: any[], mdProps: any, cmsPrefix?: string) {
  const objs: ColumnDef[] = [];
  const colHeaderRenderer = renderFuncs.nl2br(mdProps);
  for (const colDef of columnDefs) {
    let {render, renderTpl, sort, label, ...props} = colDef;
    if (typeof render === 'string') {
      render = renderFuncs[render](mdProps, cmsPrefix);
    }
    else if (renderTpl) {
      render = renderFuncs.template(renderTpl, mdProps, cmsPrefix);
    }
    else {
      render = renderFuncs.default(mdProps, cmsPrefix);
    }
    if (typeof sort === 'string') {
      sort = sortFuncs[sort];
    }
    if (colDef.label) {
      label = colHeaderRenderer(label);
    }
    objs.push(new ColumnDef({
      render, sort, label, ...props
    } as any));
  }
  return objs;
}

/**
 * Expand rows containing `multiCells` column definitions into multiple rows.
 *
 * @param data - Table data rows.
 * @param columnDefs - Processed column definitions.
 * @returns Expanded data array.
 */
export function expandMultiCells(data: any[], columnDefs: any[]) {
  let expandTarget: string | null = null;
  for (const {name, multiCells} of columnDefs) {
    if (!multiCells) {
      continue;
    }
    const [attr] = toPath(name);
    if (expandTarget && expandTarget !== attr) {
      throw new Error(
        'Can only expand one attribute of a row group, '
        + `but two were specified: ${expandTarget} and ${attr}`
      );
    }
    expandTarget = attr as string;
  }
  if (expandTarget === null) {
    return data;
  }
  const newRows: any[] = [];
  for (let i = 0; i < data.length; i ++) {
    const {...row} = data[i];
    const [...subRows] = row[expandTarget];
    delete row[expandTarget];
    for (const subRow of subRows) {
      const newRow = {...row, _spanIndex: i};
      newRow[expandTarget] = subRow;
      newRows.push(newRow);
    }
  }
  return newRows;
}

interface InlineParagraphProps {
  children?: React.ReactNode;
}

/** Simple paragraph renderer used inside tables to avoid wrapping. */
export function InlineParagraph({children}: InlineParagraphProps) {
  return <>{children}</>;
}

interface TableProps {
  cacheKey?: string;
  columnDefs: any[];
  data: any[];
  compact?: boolean;
  lastCompact?: boolean;
  noHeaderOverlapping?: boolean;
  windowScroll?: boolean;
  references?: any;
  mdProps: {components?: Record<string, any>; [key: string]: any};
  cmsPrefix?: string;
  tableScrollStyle?: React.CSSProperties;
  tableStyle?: React.CSSProperties;
}

/**
 * Render a SimpleTable with optional reference list below it.
 */
export function Table({
  cacheKey,
  columnDefs,
  data,
  compact,
  lastCompact,
  noHeaderOverlapping,
  windowScroll,
  references,
  mdProps: {components, ...mdProps},
  cmsPrefix,
  tableScrollStyle = {},
  tableStyle = {}
}: TableProps) {
  components = {
    ...components,
    p: InlineParagraph
  };
  columnDefs = buildColumnDefs(columnDefs, {...mdProps, components}, cmsPrefix);
  data = expandMultiCells(data, columnDefs);

  return <>
    <SimpleTable
      key={cacheKey}
      compact={!!compact}
      lastCompact={!!lastCompact}
      noHeaderOverlapping={noHeaderOverlapping}
      windowScroll={windowScroll}
      cacheKey={cacheKey}
      tableScrollStyle={tableScrollStyle}
      tableStyle={tableStyle}
      columnDefs={columnDefs}
      data={data} />
    <ReactMarkdown
      {...mdProps}
      components={components}
    >
      {references}
    </ReactMarkdown>
  </>;
}

interface TableNodeWrapperProps {
  tables: Record<string, {columnDefs: any[]; data: any[]}>;
  mdProps: any;
  cmsPrefix?: string;
}

/**
 * Wrap a table macro node into a React component. The wrapper looks up table
 * data by name and renders a {@link Table} or an error message when not found.
 */
export default function TableNodeWrapper({tables, mdProps, cmsPrefix}: TableNodeWrapperProps) {
  return ({
    tableName,
    compact,
    lastCompact,
    noHeaderOverlapping,
    windowScroll
  }: {
    tableName: string;
    compact?: boolean;
    lastCompact?: boolean;
    noHeaderOverlapping?: boolean;
    windowScroll?: boolean;
  }) => {
    compact = compact !== undefined;
    lastCompact = lastCompact !== undefined;
    if (tableName in tables) {
      return (
        <Table
          key={tableName}
          compact={compact}
          lastCompact={lastCompact}
          noHeaderOverlapping={noHeaderOverlapping}
          windowScroll={windowScroll}
          cacheKey={tableName}
          mdProps={mdProps}
          cmsPrefix={cmsPrefix}
          {...tables[tableName]} />
      );
    }
    return <div>
      <strong>Error</strong>: table data of {tableName} is not found.
    </div>;
  };
}
