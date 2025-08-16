import React from 'react';
import OrigMarkdown from 'react-markdown/with-html';

import {AutoTOC} from '../toc';
import Collapsable from '../collapsable';
import {
  ReferenceContext,
  useReference,
  RefLink,
  RefDefinition
} from '../references';

import MarkdownLink from './link';
import OptReferences, {StaticRefsNode} from './references';
import MdHeadingTag from './heading-tags';
import RootWrapper from './root-wrapper';
import ImageWrapper from './image-wrapper';
import macroPlugin, {BadMacroNode} from './macro-plugin';
import TableNodeWrapper from './macro-table';
import GenomeMapNodeWrapper from './macro-genome-map';
import TOCNodeWrapper from './macro-toc';

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
  /** Additional renderer components for react-markdown. */
  renderers?: Record<string, any>;
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
  renderers: addRenderers = {},
  escapeHtml = true,
  ...props
}: ExtendedMarkdownProps) {
  children = normalizeChildren(children);
  const mdProps: any = {
    parserOptions: {footnotes: true},
    transformLinkUri: false,
    escapeHtml,
    ...props
  };
  const generalRenderers = {
    link: MarkdownLink,
    image: ImageWrapper({imagePrefix}),
    footnote: RefLink,
    footnoteReference: RefLink,
    footnoteDefinition: RefDefinition,
    ...(noHeadingStyle ? null : {
      heading: MdHeadingTag(disableHeadingTagAnchor)
    }),
    ...addRenderers
  } as Record<string, any>;
  const renderers = {
    ...generalRenderers,
    BadMacroNode,
    StaticRefsNode,
      TableNode: TableNodeWrapper({tables, mdProps, cmsPrefix}),
      GenomeMapNode: GenomeMapNodeWrapper({genomeMaps: genomeMaps ?? {}}),
      TOCNode: TOCNodeWrapper({className: tocClassName}),
    ...(inline ? {} : {root: RootWrapper}),
    ...(inline ? {paragraph: ({children}: any) => <>{children}</>} : null),
    ...addRenderers
  } as Record<string, any>;
  mdProps.renderers = generalRenderers;
  let jsx = (
    <OrigMarkdown
      {...mdProps}
      key={children as any}
      children={children as any}
      renderers={renderers as Record<string, unknown>}
      plugins={[macroPlugin.transformer]} />
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
