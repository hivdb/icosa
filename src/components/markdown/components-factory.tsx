import React from 'react';

import { RefLink } from '../references';
import Collapsable from '../collapsable';
import MarkdownLink from './link';
import { BadMacroNode } from './macro-plugin';
import { StaticRefsNode } from './references';
import TableNodeWrapper from './macro-table';
import GenomeMapNodeWrapper from './macro-genome-map';
import TOCNodeWrapper from './macro-toc';
import MdHeadingTagFactory from './heading-tags-factory';
import ImageWrapper from './image-wrapper';
import { withMacroRawProps } from '../../vendor/remark-macro';

import type {MarkdownTablePreset, MarkdownRendererProps, MarkdownComponentsMap} from './types';

export interface BuildComponentsOptions {
  inline: boolean;
  imagePrefix: string;
  noHeadingStyle: boolean;
  disableHeadingTagAnchor: boolean;
  tocClassName?: string;
  tables: Record<string, MarkdownTablePreset>;
  mdProps: MarkdownRendererProps;
  cmsPrefix?: string;
  genomeMaps?: Record<string, unknown>;
  addComponents?: Record<string, any>;
}

/**
 * Build the components mapping for react-markdown consistently in one place.
 *
 * This keeps the main Markdown component small, and makes it easy to evolve
 * the element overrides without touching core rendering.
 */
export function buildMarkdownComponents({
  inline,
  imagePrefix,
  noHeadingStyle,
  disableHeadingTagAnchor,
  tocClassName,
  tables,
  mdProps,
  cmsPrefix,
  genomeMaps,
  addComponents = {}
}: BuildComponentsOptions): MarkdownComponentsMap {
  const generalComponents = {
    a: MarkdownLink,
    img: (ImageWrapper as any)({ imagePrefix }),
    'macro-bad-macro-node': withMacroRawProps(BadMacroNode),
    'macro-static-refs-node': withMacroRawProps(StaticRefsNode),
    'macro-table-node': withMacroRawProps(TableNodeWrapper({ tables, mdProps, cmsPrefix })),
    'macro-genome-map-node': withMacroRawProps(GenomeMapNodeWrapper({ genomeMaps: genomeMaps ?? {} })),
    'macro-toc-node': withMacroRawProps(TOCNodeWrapper({ className: tocClassName })),
    // Custom element for footnote references handled via reference context
    'ref-link': RefLink,
    ...(noHeadingStyle
      ? {}
      : {
          // Return the heading component directly so section grouping
          // in rehype-sectionize can detect HeadingTag elements reliably.
          h1: MdHeadingTagFactory(1, disableHeadingTagAnchor),
          h2: MdHeadingTagFactory(2, disableHeadingTagAnchor),
          h3: MdHeadingTagFactory(3, disableHeadingTagAnchor),
          h4: MdHeadingTagFactory(4, disableHeadingTagAnchor),
          h5: MdHeadingTagFactory(5, disableHeadingTagAnchor),
          h6: MdHeadingTagFactory(6, disableHeadingTagAnchor)
        }),
    ...addComponents
  } as MarkdownComponentsMap;

  return {
    ...generalComponents,
    // Map custom md-section tag produced by rehype-sectionize to our
    // Collapsable.Section React component.
    'md-section': ({ level, children }: {level: number; children?: React.ReactNode}) => (
      <Collapsable.Section level={level}>{children}</Collapsable.Section>
    ),
    ...(inline ? { p: ({ children }: {children?: React.ReactNode}) => <>{children}</> } : null)
  } as MarkdownComponentsMap;
}

export default buildMarkdownComponents;
