import React from 'react';

import { RefLink } from '../references';
import Collapsable from '../collapsable';
import MarkdownLink from './link';
import { BadMacroNode } from './macro-plugin';
import { StaticRefsNode } from './references';
import TableNodeWrapper from './macro-table';
import GenomeMapNodeWrapper from './macro-genome-map';
import TOCNodeWrapper from './macro-toc';
import MdHeadingTag from './heading-tags';
import ImageWrapper from './image-wrapper';
import { withMacroRawProps } from '../../vendor/remark-macro';

export interface BuildComponentsOptions {
  inline: boolean;
  imagePrefix: string;
  noHeadingStyle: boolean;
  disableHeadingTagAnchor: boolean;
  tocClassName?: string;
  tables: Record<string, any>;
  mdProps: Record<string, any>;
  cmsPrefix?: string;
  genomeMaps?: Record<string, any>;
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
}: BuildComponentsOptions): Record<string, any> {
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
          h1: ({ children }: any) => React.createElement(MdHeadingTag(disableHeadingTagAnchor), { level: 1, children }),
          h2: ({ children }: any) => React.createElement(MdHeadingTag(disableHeadingTagAnchor), { level: 2, children }),
          h3: ({ children }: any) => React.createElement(MdHeadingTag(disableHeadingTagAnchor), { level: 3, children }),
          h4: ({ children }: any) => React.createElement(MdHeadingTag(disableHeadingTagAnchor), { level: 4, children }),
          h5: ({ children }: any) => React.createElement(MdHeadingTag(disableHeadingTagAnchor), { level: 5, children }),
          h6: ({ children }: any) => React.createElement(MdHeadingTag(disableHeadingTagAnchor), { level: 6, children })
        }),
    ...addComponents
  } as Record<string, any>;

  return {
    ...generalComponents,
    // Map custom md-section tag produced by rehype-sectionize to our
    // Collapsable.Section React component.
    'md-section': ({ level, children }: any) => (
      <Collapsable.Section level={level}>{children}</Collapsable.Section>
    ),
    ...(inline ? { p: ({ children }: any) => <>{children}</> } : null)
  } as Record<string, any>;
}

export default buildMarkdownComponents;
