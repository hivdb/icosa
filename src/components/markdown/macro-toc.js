import React from 'react';
import PropTypes from 'prop-types';
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


TOCNodeWrapper.propTypes = {
  className: PropTypes.string
};

export default function TOCNodeWrapper({className: globalClassName}) {
  // eslint-disable-next-line react/prop-types
  return ({children, props: {className, ...props}}) => (
    <BasicTOC
     {...props}
     className={classNames(className, globalClassName)}>
      {children}
    </BasicTOC>
  );
}
