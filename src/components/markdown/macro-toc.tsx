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
  helpers: { parseBlock?: (md: string) => any[]; transformer?: { tokenizeBlock: (c: string, now: any) => any }; eat?: { now: () => any } }
) {
  // Prefer modern parseBlock helper; fall back to legacy tokenizeBlock when available
  let children: any[] = [];
  if (helpers?.parseBlock) {
    children = helpers.parseBlock(content) ?? [];
  } else if (helpers?.transformer && helpers?.eat) {
    children = helpers.transformer.tokenizeBlock(content, helpers.eat.now());
  }
  return {
    type: 'TOCNode',
    props,
    children,
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
