import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import {AutoTOC} from '../toc';
import Collapsable from '../collapsable';
import { ReferenceContext, useReference } from '../references';

import OptReferences from './references';
import macroPlugin from './macro-plugin';
import footnoteReferencePlugin from './footnote-plugin';
import buildMarkdownComponents from './components-factory';

/**
 * Normalize markdown children by concatenating arrays into a single string.
 *
 * @param children - Raw markdown content or array of fragments.
 * @returns A single markdown string.
 */
export function normalizeChildren(children: string | string[]): string {
  return Array.isArray(children) ? children.join('') : children;
}

/**
 * Structure of a table referenced by markdown macros.
 */
interface MarkdownTable {
  /** Column definitions for the table. */
  columnDefs: any[];
  /** Data rows for the table. */
  data: any[];
}

/**
 * Props accepted by {@link ExtendedMarkdown}.
 */
export interface ExtendedMarkdownProps {
  /** Enable automatic table of contents rendering. */
  toc?: boolean;
  /** Markdown source string or array of strings. */
  children: string | string[];
  /** CSS class name applied to TOC container. */
  tocClassName?: string;
  /** Render markdown inline without block level wrapper. */
  inline?: boolean;
  /** Additional components mapping for react-markdown. */
  components?: Record<string, any>;
  /** Levels to be wrapped by collapsable sections. */
  collapsableLevels?: number[];
  /** Disable anchor links on heading tags. */
  disableHeadingTagAnchor?: boolean;
  /** Do not apply default heading tag styles. */
  noHeadingStyle?: boolean;
  /** Title displayed above the references list. */
  referenceTitle?: string;
  /** Heading level for the references section. */
    referenceHeadingTagLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Optional component to load references asynchronously. */
  refDataLoader?: React.ComponentType<any>;
  /** Prefix prepended to relative image sources. */
  imagePrefix?: string;
  /** Optional CMS prefix for tables. */
  cmsPrefix?: string;
  /** Toggle rendering of footnote references. */
  displayReferences?: boolean;
  /** Presets for genome map macros. */
  genomeMaps?: Record<string, any>;
  /** Table data available for the `table` macro. */
  tables?: Record<string, MarkdownTable>;
  /**
   * Whether to escape HTML in markdown content.
   * Defaults to `true` for security reasons.
   */
  escapeHtml?: boolean;
  /**
   * Any additional props are forwarded to `react-markdown`.
   */
  [key: string]: any;
}

/**
 * ExtendedMarkdown renders markdown content with optional table of
 * contents, reference links, and macro support. It wraps `react-markdown`
 * and exposes additional hooks used throughout the application.
 *
 * @param props - {@link ExtendedMarkdownProps} controlling rendering behaviour.
 * @returns Rendered markdown element tree.
 */
function ExtendedMarkdown({
  noHeadingStyle = false,
  toc = false,
  children,
  referenceTitle = 'References',
  inline = false,
  tocClassName,
  disableHeadingTagAnchor = false,
    referenceHeadingTagLevel = 2,
  collapsableLevels,
  imagePrefix = '/',
  cmsPrefix,
  tables = {},
  genomeMaps,
  refDataLoader,
  displayReferences = true,
  components: addComponents = {},
  escapeHtml = true,
  ...props
}: ExtendedMarkdownProps) {
  children = normalizeChildren(children);
  const mdProps: any = {
    urlTransform: (url: string) => url,
    // Order matters: GFM parses footnotes; our plugin converts them to ref-link elements.
    remarkPlugins: [macroPlugin.attacher, remarkGfm, footnoteReferencePlugin],
    rehypePlugins: escapeHtml ? [] : [rehypeRaw],
    ...props
  };
  const components = buildMarkdownComponents({
    inline,
    imagePrefix,
    noHeadingStyle,
    disableHeadingTagAnchor,
    tocClassName,
    tables,
    mdProps,
    cmsPrefix,
    genomeMaps,
    addComponents
  });

  let jsx = (
    <ReactMarkdown
      {...mdProps}
      components={components}
      key={children as any}
    >
      {children as any}
    </ReactMarkdown>
  );
  const refContext = useReference(
    refDataLoader as React.ComponentType<any> | undefined,
    /* cacheKey = */ children
  );
  if (displayReferences) {
    jsx = (
      <ReferenceContext.Provider value={refContext}>
        {jsx}
        <OptReferences
          disableAnchor={disableHeadingTagAnchor}
          level={referenceHeadingTagLevel}
          referenceTitle={referenceTitle}
        />
      </ReferenceContext.Provider>
    );
  }
  if (collapsableLevels && collapsableLevels.length > 0) {
    const levels = collapsableLevels.map(
      l => `h${l}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    );
    jsx = <Collapsable levels={levels}>{jsx}</Collapsable>;
  }
  if (toc) {
    return (
      <AutoTOC
        key={children as any}
        className={tocClassName}>
        {jsx}
      </AutoTOC>
    );
  }
  return jsx;
}
export {ExtendedMarkdown};
/**
 * Compare two sets of props to determine if memoized rendering can be skipped.
 * Only the `children` field is relevant because the output is entirely derived
 * from the markdown string.
 *
 * @param prev - Previous props.
 * @param next - Next props.
 * @returns `true` when the markdown source is identical.
 */
export function areChildrenEqual(
  {children: prev}: ExtendedMarkdownProps,
  {children: next}: ExtendedMarkdownProps
): boolean {
  return prev === next;
}

export default React.memo(ExtendedMarkdown, areChildrenEqual);
