import type React from 'react';
import type {Pluggable} from 'unified';
import type {ColumnRender} from '../simple-table/types';

/** Generic row shape for Markdown-driven tables. */
export interface MDRow {
  [key: string]: any;
}

/** Column definition passed by CMS/preset for macro-table. */
export interface PresetColumnDef {
  name: string;
  label?: React.ReactNode;
  render?: string | ColumnRender<unknown, MDRow>;
  renderTpl?: string;
  sort?: string | ((rows: MDRow[], column?: string) => MDRow[]);
  multiCells?: boolean;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  [key: string]: unknown;
}

/** Table preset structure rendered by macro-table. */
export interface MarkdownTablePreset {
  columnDefs: PresetColumnDef[];
  data: MDRow[];
}

/**
 * Minimal props passed to ReactMarkdown renderer from macro-table/Table.
 */
export interface MarkdownRendererProps {
  components?: MarkdownComponentsMap;
  remarkPlugins?: Pluggable[];
  rehypePlugins?: Pluggable[];
  urlTransform?: (url: string) => string;
  [key: string]: unknown;
}

/**
 * Components map for react-markdown with support for our custom macro elements.
 */
export interface MarkdownComponentsMap {
  [key: string]: React.ComponentType<any>;
}

export interface Article {
  doi?: string;
  journal?: string;
  journalShort?: string;
  freeText?: string;
  firstAuthor?: {
    surname?: string;
  };
  year?: number;
}

export interface CompoundEC50 {
  name: string;
  ec50?: number;
  ec50Note?: string;
}
