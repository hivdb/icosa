import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import Children from 'react-children-utilities';

import ReferenceContext from './reference-context';
import InlineRef from './inline-reference';
import buildRef from './build-ref';
import {focusElement} from './funcs';

import style from './style.module.scss';


function RefLinkInternal({
  name,
  refContext: {
    setReference,
    getReference,
    ensureLoaded
  },
  ...ref
}) {

  const linkRef = React.createRef();

  React.useEffect(() => {
    setTimeout(() => {
      const elem = linkRef.current;
      if (!elem) {
        return;
      }
      let anchor = window.location.hash;
      if (anchor) {
        anchor = anchor.slice(1);
        if (anchor.length > 0 && anchor === elem.id) {
          focusElement(elem);
        }
      }
    });
  });

  const {number, itemId, linkId} = setReference(
    name, ref, /* incr=*/ true, true
  );

  const trigger = (
    <sup><a className={style['ref-link']}
     onClick={handleClick}
     ref={linkRef}
     id={linkId} href={`#ref__${itemId}`}>
      [{number}]
    </a></sup>
  );

  return ensureLoaded(
    () => (
      <Popup
       on="click"
       position={[
         'top center',
         'right center',
         'bottom center',
         'left center'
       ]}
       className={style['ref-popup']}
       closeOnDocumentClick
       keepTooltipInside
       repositionOnResize
       trigger={trigger}>
        <a
         onClick={handleAnchorClick}
         href={`#ref__${itemId}`}>
          {number}
        </a>.{' '}
        {buildRef(getReference(name))}
      </Popup>
    ),
    trigger
  );

  function handleClick(evt) {
    evt && evt.preventDefault();
  }

  function handleAnchorClick(evt) {
    const {href} = evt.currentTarget.attributes;
    const anchor = href.value.slice(1);
    setTimeout(() => {
      const elem = document.getElementById(anchor);
      const parentLi = elem.closest('li');
      focusElement(parentLi);
    });
  }

}

RefLinkInternal.propTypes = {
  name: PropTypes.string,
  authors: PropTypes.string,
  year: PropTypes.string,
  title: PropTypes.string,
  journal: PropTypes.string,
  medlineId: PropTypes.string,
  url: PropTypes.string,
  children: PropTypes.node
};


function RefLink({name, identifier, ...props}) {
  const refContext = React.useContext(ReferenceContext);

  if (identifier && identifier.toLocaleLowerCase().endsWith('#inline')) {
    identifier = identifier.slice(0, identifier.length - 7);
    return <InlineRef name={identifier} />;
  }

  name = name || identifier;
  if (!name) {
    const {authors, year} = props;
    if (authors) {
      name = `${authors.split(' ', 2)[0]}${year}`;
    }
    else {
      name = Children.onlyText(props.children);
    }
  }

  for (const [key, val] of Object.entries(props)) {
    if (val === undefined) {
      delete props[key];
    }
  }

  return (
    <RefLinkInternal
     {...props}
     key={name}
     name={name}
     refContext={refContext} />
  );
}


export default React.memo(
  RefLink,
  ({name: prev}, {name: next}) => prev === next
);
