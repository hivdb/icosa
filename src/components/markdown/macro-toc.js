import React from 'react';
import classNames from 'classnames';

import macroPlugin from './macro-plugin';
import BasicTOC from '../toc';

macroPlugin.addMacro('toc', (content, props, {transformer, eat}) => {
  return {
    type: 'TOCNode',
    props,
    children: transformer.tokenizeBlock(content, eat.now())
  };
});


export default function TOCNodeWrapper({className: globalClassName}) {
  return ({children, props: {className, ...props}}) => (
    <BasicTOC
     {...props}
     className={classNames(className, globalClassName)}>
      {children}
    </BasicTOC>
  );
}
