import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import Children from 'react-children-utilities';

import ReferenceContext from './reference-context';
import InlineRef from './inline-reference';
import buildRef from './build-ref';
import {focusElement} from './funcs';

import style from './style.module.scss';


export default class RefLink extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    identifier: PropTypes.string,
    authors: PropTypes.string,
    year: PropTypes.string,
    title: PropTypes.string,
    journal: PropTypes.string,
    medlineId: PropTypes.string,
    url: PropTypes.string,
    children: PropTypes.node
  }

  constructor() {
    super(...arguments);
    this.linkRef = React.createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      const elem = this.linkRef.current;
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
    evt && evt.preventDefault();
  }

  handleAnchorClick = (evt) => {
    const {href} = evt.currentTarget.attributes;
    const anchor = href.value.slice(1);
    setTimeout(() => {
      const elem = document.getElementById(anchor);
      const parentLi = elem.closest('li');
      focusElement(parentLi);
    });
  }

  render() {
    let {name, identifier, ...ref} = this.props;

    if (identifier && identifier.toLocaleLowerCase().endsWith('#inline')) {
      identifier = identifier.slice(0, identifier.length - 7);
      return <InlineRef name={identifier} />;
    }

    name = name || identifier;
    if (!name) {
      const {authors, year} = ref;
      if (authors) {
        name = `${authors.split(' ', 2)[0]}${year}`;
      }
      else {
        name = Children.onlyText(ref.children);
      }
    }

    return <ReferenceContext.Consumer>
      {({setReference, getReference, ensureLoaded}) => {
        const {number, itemId, linkId} = setReference(
          name, ref, /* incr=*/ true
        );

        const trigger = (
          <sup><a className={style['ref-link']}
           onClick={this.handleClick}
           ref={this.linkRef}
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
               onClick={this.handleAnchorClick}
               href={`#ref__${itemId}`}>
                {number}
              </a>.{' '}
              {buildRef(getReference(name))}
            </Popup>
          ),
          trigger
        );
      }}
    </ReferenceContext.Consumer>;
  }

}
