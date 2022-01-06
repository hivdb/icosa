import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';
import Popup from 'reactjs-popup';
import Children from 'react-children-utilities';

import ReferenceContext from './reference-context';
import InlineRef from './inline-reference';
import buildRef from './build-ref';
import {focusElement} from './funcs';

import style from './style.module.scss';

function RefLinkInternal({
  group,
  name,
  refContext: {
    setReference,
    getReference,
    ensureLoaded
  },
  ...ref
}) {

  const linkRef = React.useRef();
  const [refObj, setRefObj] = React.useState();

  React.useEffect(
    () => {
      const refObj = setReference(name, ref, /* incr= */ true);
      setRefObj(refObj);
    },
    [setReference] // eslint-disable-line react-hooks/exhaustive-deps
  );

  let number, itemId, linkId, loaded = false;
  if (refObj) {
    number = refObj.number;
    itemId = refObj.itemId;
    linkId = refObj.linkId;
    loaded = true;
  }

  const elemId = group ? `${group}__${linkId}` : linkId;
  const anchorTarget = group ? `ref__${group}__${itemId}` : `ref__${itemId}`;

  React.useEffect(
    () => {
      if (loaded) {
        setTimeout(() => {
          const elem = linkRef.current;
          if (!elem) {
            return;
          }
          let anchor = window.location.hash;
          if (anchor) {
            anchor = anchor.slice(1);
            if (anchor.length > 0 && anchor === elemId) {
              focusElement(elem);
            }
          }
        });
      }
    },
    [loaded, elemId]
  );

  const handleClick = React.useCallback(
    evt => {
      evt && evt.preventDefault();
    },
    []
  );

  const {match: {location}, router} = useRouter();

  const handleAnchorClick = React.useCallback(
    evt => {
      evt.preventDefault();
      const {href} = evt.currentTarget.attributes;
      const anchor = href.value.slice(1);
      router.push({
        ...location,
        hash: `#${anchor}`
      });
      setTimeout(() => {
        const elem = document.getElementById(anchor);
        if (elem) {
          const parentLi = elem.closest('li');
          focusElement(parentLi);
        }
      });
    },
    [location, router]
  );

  if (!loaded) {
    return null;
  }

  const trigger = (
    <sup><a
     className={style['ref-link']}
     onClick={handleClick}
     ref={linkRef}
     id={elemId} href={`#${anchorTarget}`}>
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
         href={`#${anchorTarget}`}>
          {number}
        </a>.{' '}
        {buildRef(getReference(name))}
      </Popup>
    ),
    trigger
  );
}

RefLinkInternal.propTypes = {
  group: PropTypes.string,
  name: PropTypes.string,
  authors: PropTypes.string,
  year: PropTypes.string,
  title: PropTypes.string,
  journal: PropTypes.string,
  medlineId: PropTypes.string,
  url: PropTypes.string,
  children: PropTypes.node
};

const MemoRefLinkInternal = React.memo(
  RefLinkInternal,
  ({
    group: prevGroup,
    name: prevName
  }, {
    group: nextGroup,
    name: nextName
  }) => prevGroup === nextGroup && prevName === nextName
);


RefLink.propTypes = {
  group: PropTypes.string,
  name: PropTypes.string,
  identifier: PropTypes.string,
  authors: PropTypes.string,
  year: PropTypes.number,
  children: PropTypes.node
};

export default function RefLink({group, name, identifier, ...props}) {
  const refContext = React.useContext(ReferenceContext);

  if (identifier && identifier.toLocaleLowerCase().endsWith('#inline')) {
    identifier = identifier.slice(0, identifier.length - 7);
    return <InlineRef group={group} name={identifier} />;
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
    <MemoRefLinkInternal
     {...props}
     key={`${group}${name}`}
     group={group}
     name={name}
     refContext={refContext} />
  );
}
