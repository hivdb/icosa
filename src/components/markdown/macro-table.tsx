import React from 'react';
import toPath from 'lodash/toPath';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import ReactMarkdown from 'react-markdown';

import macroPlugin from './macro-plugin';
import SimpleTable, {ColumnDef, RowContext} from '../simple-table';
import type {ColumnDefOptions} from '../simple-table/types';
import type {Article, CompoundEC50, MDRow, PresetColumnDef, MarkdownTablePreset, MarkdownRendererProps} from './types';
import {createUnsafeRenderFromTpl} from '../simple-table/column-def';
import rehypeSectionize from './rehype-sectionize';

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
function defaultRenderer(mdProps: MarkdownRendererProps, cmsPrefix?: string) {
  return (value: unknown): React.ReactNode => {
    if (value === '-') {
      return value;
    }
    else if (typeof value === 'string') {
      const replaced = value.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix ?? '');
      return <ReactMarkdown {...mdProps}>{replaced}</ReactMarkdown>;
    }
    return value as React.ReactNode;
  };
}

/**
 * A collection of supported render functions referenced by string name in
 * table column definitions.
 */
type RendererFactory = (mdProps: MarkdownRendererProps, cmsPrefix?: string) => (
  value: any,
  row: MDRow,
  context: RowContext,
  config: Record<string, unknown>
) => React.ReactNode;

const renderTemplate = (
  tpl: string,
  mdProps: MarkdownRendererProps,
  cmsPrefix?: string
) => {
  const renderTpl = createUnsafeRenderFromTpl<unknown, MDRow>(tpl, true);
  return (value: unknown, row: MDRow, context: RowContext, config: Record<string, unknown>) =>
    defaultRenderer(mdProps, cmsPrefix)(renderTpl(value, row, context, config));
};

const renderFuncs: Record<string, RendererFactory> = {
  default: (mdProps, cmsPrefix) => (value) => defaultRenderer(mdProps, cmsPrefix)(value),
  nl2br: (mdProps, cmsPrefix) => (value) => defaultRenderer(mdProps, cmsPrefix)(nl2brMdText(value)),
  join: (mdProps, cmsPrefix) => (value, _row, _context, {joinBy = ''}) => defaultRenderer(mdProps, cmsPrefix)((Array.isArray(value) ? value : [value]).join(String(joinBy))),
  articleList: (mdProps: MarkdownRendererProps, cmsPrefix?: string) => {
    const freeTextRenderer = defaultRenderer(mdProps, cmsPrefix);
    return (articles: Article[]) => (
      <>
        {(Array.isArray(articles) ? articles : []).map((item, idx) => {
          const {doi, firstAuthor, year, journal, journalShort, freeText} = item ?? {};
          const surname = firstAuthor?.surname ?? '';
          return (
            <div key={idx}>
              {freeText ?
                freeTextRenderer(freeText) : <>
                  <a href={`https://doi.org/${doi}`} rel="noopener noreferrer" target="_blank">
                    {surname} {year}
                  </a>{' '}({journalShort ? journalShort : journal})
                </>}
            </div>
          );
        })}
      </>
    );
  },
  compoundEC50Obj: (mdProps: MarkdownRendererProps, cmsPrefix?: string) => {
    const freeTextRenderer = defaultRenderer(mdProps, cmsPrefix);
    return (compounds: CompoundEC50[]) => {
      const list = compounds ?? [];
      const content = list.map(({name, ec50, ec50Note}) => {
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
  nowrap: (mdProps: MarkdownRendererProps, cmsPrefix?: string) => (value) => (
    <span className={style.nowrap}>{defaultRenderer(mdProps, cmsPrefix)(value)}</span>
  ),
  checkMark: () => (value) => (value ? '\u2713' : '')
};

/** Sorting helper functions referenced by string name. */
const sortFuncs: Record<string, (rows: MDRow[], column?: string) => MDRow[]> = {
  articleList: (rows: MDRow[]) => sortBy(rows, (row: MDRow) => {
    const refs = row.references as Article[] | undefined;
    return (refs ?? []).map(({firstAuthor, year} = {}) => [firstAuthor?.surname || '', -(year ?? 0)]);
  }),
  numeric: (rows: MDRow[], column: string = '') => sortBy(
    rows,
    row => {
      const v = nestedGet(row, column);
      return parseInt(String(v));
    }
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
export function buildColumnDefs(columnDefs: PresetColumnDef[], mdProps: MarkdownRendererProps, cmsPrefix?: string) {
  const objs: ColumnDef<unknown, MDRow>[] = [];
  const colHeaderRenderer = (value: unknown) => defaultRenderer(mdProps, cmsPrefix)(nl2brMdText(value));
  for (const colDef of columnDefs) {
    let {render, renderTpl, sort, label, ...props} = colDef;
    if (typeof render === 'string') {
      render = renderFuncs[render](mdProps, cmsPrefix);
    }
    else if (renderTpl) {
      render = renderTemplate(renderTpl, mdProps, cmsPrefix);
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
    const def = {
      ...props,
      name: colDef.name,
      render,
      sort,
      label
    } as ColumnDefOptions<unknown, MDRow>;
    objs.push(new ColumnDef(def));
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
export function expandMultiCells(data: MDRow[], columnDefs: ColumnDef<unknown, MDRow>[]) {
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
    expandTarget = attr;
  }
  if (expandTarget === null) {
    return data;
  }
  const newRows: MDRow[] = [];
  for (let i = 0; i < data.length; i ++) {
    const base = {...data[i]};
    const val = base[expandTarget];
    const subRows = Array.isArray(val) ? val : [];
    delete base[expandTarget];
    for (const subRow of subRows) {
      const newRow: MDRow = {...base, _spanIndex: i};
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
  columnDefs: PresetColumnDef[];
  data: MDRow[];
  compact?: boolean;
  lastCompact?: boolean;
  noHeaderOverlapping?: boolean;
  windowScroll?: boolean;
  references?: string;
  mdProps: MarkdownRendererProps;
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
  mdProps: {components, rehypePlugins = [], ...mdProps},
  cmsPrefix,
  tableScrollStyle = {},
  tableStyle = {}
}: TableProps) {
  components = {
    ...components,
    p: InlineParagraph
  };
  // Remove rehypeSectionize from rehypePlugins for table rendering
  const filteredRehypePlugins = rehypePlugins.filter((plugin: unknown) => plugin !== rehypeSectionize);

  const processedColumnDefs = buildColumnDefs(columnDefs, {...mdProps, components, rehypePlugins: filteredRehypePlugins}, cmsPrefix);
  const processedData = expandMultiCells(data, processedColumnDefs);

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
      columnDefs={processedColumnDefs}
      data={processedData} />
    <ReactMarkdown
      {...mdProps}
      rehypePlugins={filteredRehypePlugins}
      components={components}
    >
      {references}
    </ReactMarkdown>
  </>;
}

interface TableNodeWrapperProps {
  tables: Record<string, MarkdownTablePreset>;
  mdProps: MarkdownRendererProps;
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
