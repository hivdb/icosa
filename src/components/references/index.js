import React from 'react';
import PropTypes from 'prop-types';
import ReferenceContext, {useReference} from './reference-context';
import RefLink from './reference-link';
import RefDefinition from './reference-definition';
import buildRef from './build-ref';
import style from './style.module.scss';
import LoadExternalRefData from './load-references';
import InlineRef from './inline-reference';
import {focusElement} from './funcs';

import InlineLoader from '../inline-loader';

export {
  ReferenceContext,
  useReference,
  InlineRef,
  RefLink,
  RefDefinition,
  LoadExternalRefData
};


class RefItem extends React.Component {

  constructor() {
    super(...arguments);
    this.itemRef = React.createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      const elem = this.itemRef.current;
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

  handleClick = (evt) => {
    const {href} = evt.currentTarget.attributes;
    const anchor = href.value.slice(1);
    setTimeout(() => {
      const elem = document.getElementById(anchor);
      focusElement(elem);
    });
  }
  
  render() {
    const {number, itemId, linkIds} = this.props;
    const children = buildRef(this.props);
    const multiLinks = linkIds.length > 1;
    if (linkIds.length === 0) {
      return null;
    }
    return <li id={`ref__${itemId}`} ref={this.itemRef}>
      {multiLinks ? <><span>^</span> </> : null}
      {linkIds.map((linkId, idx) => [
        <a
         key={idx}
         className={style['cite-back-link']}
         onClick={this.handleClick}
         href={`#${linkId}`}>
          {multiLinks ? <sup>{number}.{idx + 1}</sup> : '^'}
        </a>,
        ' '
      ])}
      {children}
    </li>;
  }
}


function References({
  onLoad,
  placeholder
}) {

  return <ol className={style.references}>
    <ReferenceContext.Consumer>
      {({ensureLoaded}) => (
        ensureLoaded(
          ({setReference, getLinkedReferences}) => (
            getLinkedReferences().map(refProps => (
              <RefItem {...refProps} key={refProps.itemId} />
            ))
          ),
          placeholder
        )
      )}
    </ReferenceContext.Consumer>
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
