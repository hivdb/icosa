import React from 'react';
import classNames from 'classnames';

import macroPlugin from './macro-plugin';
import BasicTOC from '../toc';

/**
 * Build an AST node descriptor for the `toc` macro.
 *
 * @param content - Inner markdown content of the TOC block.
 * @param props - Additional properties for the TOC component.
 * @param helpers - Transformer and position utilities from remark-macro.
 * @returns Node descriptor consumed by the macro plugin.
 */
export function tocMacro(
  content: string,
  props: Record<string, unknown>,
  {transformer, eat}: {transformer: {tokenizeBlock: (c: string, now: any) => any}; eat: {now: () => any}}
) {
  return {
    type: 'TOCNode',
    props,
    children: transformer.tokenizeBlock(content, eat.now())
  } as const;
}

macroPlugin.addMacro('toc', tocMacro);

interface TOCNodeWrapperProps {
  className?: string;
}

interface TOCNodeProps {
  children?: React.ReactNode;
  props: {
    className?: string;
    [key: string]: unknown;
  };
}

export default function TOCNodeWrapper({className: globalClassName}: TOCNodeWrapperProps) {
  return ({children, props: {className, ...props}}: TOCNodeProps) => (
    <BasicTOC
     {...props}
     className={classNames(className, globalClassName)}>
      {children}
    </BasicTOC>
  );
}
