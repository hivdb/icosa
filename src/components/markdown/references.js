import React from 'react';

import Collapsable from '../collapsable';
import {HeadingTag} from '../heading-tags';
import References, {InlineRef, ReferenceContext} from '../references';

import macroPlugin from './macro-plugin';


macroPlugin.addMacro('refs', (content, props) => {
  return {
    type: 'StaticRefsNode',
    names: (
      content.split(/[\r\n]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0)
    ),
    ...props
  };
});


export function StaticRefsNode({names, as = 'ul', className, style}) {
  if (as !== 'ul' && as !== 'ol') {
    as = 'ul';
  }

  return React.createElement(
    as,
    {className, style},
    names.map(name => (
      <li key={name}>
        <InlineRef name={name} />
      </li>
    ))
  );
}


export default function OptReferences({
  level, disableAnchor, referenceTitle
}) {
  return <ReferenceContext.Consumer>
    {({hasAnyReference}) => hasAnyReference() ? (
      <Collapsable.Section
       level={level}
       alwaysCollapsable
       data-section-reference="">
        {({onLoad}) => <>
          <HeadingTag {...{disableAnchor, level}}>{referenceTitle}</HeadingTag>
          <References onLoad={onLoad} />
        </>}
      </Collapsable.Section>
    ) : null}
  </ReferenceContext.Consumer>;
}
