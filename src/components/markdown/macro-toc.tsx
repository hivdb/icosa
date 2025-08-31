import React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';

import macroPlugin from './macro-plugin';
import BasicTOC from '../toc';

/**
 * Build an AST node descriptor for the `toc` macro.
 *
 * @param content - Inner markdown content of the TOC block.
 * @param props - Additional properties for the TOC component.
 * @param helpers - Reserved (legacy); ignored in the modern path.
 * @returns Node descriptor consumed by the macro plugin carrying a `markdown` field.
 */
export function tocMacro(
  content: string,
  props: Record<string, unknown>,
  _helpers: { parseBlock?: (md: string) => string[] }
) {
  // Pass raw markdown through as a prop; we’ll render it at component time
  return {
    type: 'TOCNode',
    props,
    markdown: content,
  } as const;
}

macroPlugin.addMacro('toc', tocMacro);

interface TOCNodeWrapperProps {
  className?: string;
}

interface TOCNodeProps {
  markdown?: string;
  props: {
    className?: string;
    [key: string]: unknown;
  };
  children?: React.ReactNode;
}

export default function TOCNodeWrapper({className: globalClassName}: TOCNodeWrapperProps) {
  return ({ markdown = '', props: { className, ...props } }: TOCNodeProps) => (
    <BasicTOC {...props} className={classNames(className, globalClassName)}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </BasicTOC>
  );
}
