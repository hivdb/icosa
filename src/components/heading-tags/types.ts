import type React from 'react';

/**
 * Props for the HeadingTag component.
 */
export interface HeadingTagProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Custom ID for the heading element. If not provided, an anchor is generated from children.
   */
  id?: string;
  /**
   * Heading level (1-6).
   */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Additional CSS class names.
   */
  className?: string;
  /**
   * Heading content.
   */
  children: React.ReactNode;
  /**
   * Whether to disable the anchor link icon.
   */
  disableAnchor?: boolean;
}

/**
 * Props for H1-H6 wrapper components (HeadingTag without level prop).
 */
export type HeadingTagWrapperProps = Omit<HeadingTagProps, 'level'>;
