import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import ReferenceContext, {useReference} from './reference-context';
import RefLink from './reference-link';
import RefDefinition from './reference-definition';
import buildRef from './build-ref';
import style from './style.module.scss';
import LoadExternalRefData from './load-references';
import InlineRef from './inline-reference';
import {focusElement} from './funcs';
import useAutoUpdate from './use-auto-update';

import InlineLoader from '../inline-loader';

export {
  ReferenceContext,
  useAutoUpdate,
  useReference,
  InlineRef,
  RefLink,
  RefDefinition,
  LoadExternalRefData
};


function RefItem(props) {
  const itemRef = React.useRef();

  React.useEffect(
    () => {
      setTimeout(() => {
        const elem = itemRef.current;
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
    }
  );

  const {match: {location}, router} = useRouter();

  const handleClick = React.useCallback(
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
        focusElement(elem);
      });
    },
    [location, router]
  );

  const {number, itemId, linkIds} = props;
  const children = buildRef(props);
  const multiLinks = linkIds.length > 1;
  if (linkIds.length === 0) {
    return null;
  }
  return <li id={`ref__${itemId}`} ref={itemRef}>
    {multiLinks ? <><span>^</span> </> : null}
    {linkIds.map((linkId, idx) => [
      <a
       key={idx}
       className={style['cite-back-link']}
       onClick={handleClick}
       href={`#${linkId}`}>
        {multiLinks ? <sup>{number}.{idx + 1}</sup> : '^'}
      </a>,
      ' '
    ])}
    {children}
  </li>;
  
}


function References({
  onLoad,
  placeholder
}) {

  const {ensureLoaded} = React.useContext(ReferenceContext);
  useAutoUpdate();

  return <ol className={style.references}>
    {ensureLoaded(
      ({setReference, getLinkedReferences}) => (
        getLinkedReferences().map(refProps => (
          <RefItem {...refProps} key={refProps.itemId} />
        ))
      ),
      placeholder
    )}
  </ol>;

}

References.propTypes = {
  onLoad: PropTypes.func,
  placeholder: PropTypes.node.isRequired
};


References.defaultProps = {
  placeholder: <InlineLoader />
};


export default References;
