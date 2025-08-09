import React from 'react';
import classNames from 'classnames';

import macroPlugin from './macro-plugin';
import BasicTOC from '../toc';

macroPlugin.addMacro(
  'toc',
  (
    content: string,
    props: Record<string, unknown>,
    {transformer, eat}: {transformer: {tokenizeBlock: (c: string, now: any) => any}; eat: {now: () => any}}
  ) => {
    return {
      type: 'TOCNode',
      props,
      children: transformer.tokenizeBlock(content, eat.now())
    } as const;
  }
);

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
