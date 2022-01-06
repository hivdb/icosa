import React from 'react';
import PropTypes from 'prop-types';

import Collapsable from '../collapsable';
import {HeadingTag} from '../heading-tags';
import References, {
  InlineRef,
  useAutoUpdate,
  ReferenceContext,
  LoadExternalRefData
} from '../references';

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


StaticRefsNode.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  as: PropTypes.elementType,
  className: PropTypes.string,
  style: PropTypes.object
};

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


OptReferences.propTypes = {
  level: PropTypes.number,
  disableAnchor: PropTypes.bool,
  referenceTitle: PropTypes.node
};

export default function OptReferences({
  level, disableAnchor, referenceTitle
}) {
  const {hasAnyReference} = React.useContext(ReferenceContext);
  useAutoUpdate();

  if (hasAnyReference(/* includeInlines=*/true)) {
    const hasFootnoteReferences = hasAnyReference(/* includeInlines=*/false);
    return <>
      <LoadExternalRefData />
      {hasFootnoteReferences ?
        <Collapsable.Section
         level={level}
         alwaysCollapsable
         data-section-reference="">
          {({onLoad}) => <>
            <HeadingTag {...{disableAnchor, level}}>
              {referenceTitle}
            </HeadingTag>
            <References onLoad={onLoad} />
          </>}
        </Collapsable.Section> :
        null}
    </>;
  }
  return null;
}
