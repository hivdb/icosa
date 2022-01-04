import React from 'react';
import PropTypes from 'prop-types';
import {FaArrowUp} from '@react-icons/all-files/fa/FaArrowUp';
import {FaArrowDown} from '@react-icons/all-files/fa/FaArrowDown';

import Markdown from '../../../../components/markdown';

import style from './style.module.scss';


export default class ViewerFooter extends React.Component {

  static propTypes = {
    refDataLoader: PropTypes.func,
    commentLookup: PropTypes.objectOf(PropTypes.shape({
      position: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired
    }).isRequired).isRequired,
    commentReferences: PropTypes.string.isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {expanded: false};
    this.defaultBodyOverflow = document.body.style.overflow;
    this.scrollableRef = React.createRef();
  }

  get commentMdText() {
    const {commentLookup, commentReferences, selectedPositions} = this.props;
    const buffer = [];
    for (const pos of selectedPositions) {
      if (!(pos in commentLookup)) {
        continue;
      }
      const {comment} = commentLookup[pos];
      buffer.push(`- ${comment}`);
    }
    if (buffer.length > 0) {
      let leadText = 'Following position has been selected:';
      if (buffer.length > 1) {
        leadText = 'Following positions have been selected:';
      }
      return (
        `\n## Comments\n\n${leadText}\n` +
        `\n${buffer.join('\n')}\n\n${commentReferences}`
      );
    }
    return 'Select positions/a position to view the comments.';
  }

  get hasSelectedComments() {
    const {commentLookup, selectedPositions} = this.props;
    return Object.keys(commentLookup)
      .some(pos => selectedPositions.includes(parseInt(pos)));
  }

  toggleDisplay = () => {
    const {expanded} = this.state;
    if (!expanded) {
      document.body.style.overflow = 'hidden';
    }
    else {
      this.scrollableRef.current.scrollTo({top: 0});
      document.body.style.overflow = this.defaultBodyOverflow;
    }
    this.setState({expanded: !expanded});
  }

  render() {
    const {commentMdText, hasSelectedComments} = this;
    let {expanded} = this.state;
    expanded = hasSelectedComments ? expanded : false;
    const {refDataLoader} = this.props;
    return <div
     className={style['footer-container']}
     data-expanded={expanded}>
      <section
       className={style.footer}>
        <button
         className={style["toggle-button"]}
         disabled={!hasSelectedComments}
         onClick={this.toggleDisplay}>
          {expanded ? <FaArrowDown /> : <FaArrowUp />}
          {expanded ? 'Less' : 'More'}
        </button>
        <div className={style.scrollable} ref={this.scrollableRef}>
          <Markdown
           disableHeadingTagAnchor
           {...{refDataLoader}}>
            {commentMdText}
          </Markdown>
        </div>
      </section>
    </div>;
  }

}
