import React from 'react';
import PropTypes from 'prop-types';
import {FaArrowUp} from '@react-icons/all-files/fa/FaArrowUp';
import {FaArrowDown} from '@react-icons/all-files/fa/FaArrowDown';

import Markdown from '../../../../components/markdown';

import style from './style.module.scss';


ViewerFooter.propTypes = {
  refDataLoader: PropTypes.func,
  commentLookup: PropTypes.objectOf(PropTypes.shape({
    position: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired
  }).isRequired).isRequired,
  commentReferences: PropTypes.string.isRequired,
  selectedPositions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired
};

export default function ViewerFooter({
  refDataLoader,
  commentLookup,
  commentReferences,
  selectedPositions
}) {

  const [expanded, setExpanded] = React.useState(false);
  const [defaultBodyOverflow] = React.useState(document.body.style.overflow);
  const scrollableRef = React.useRef();

  const commentMdText = React.useMemo(
    () => {
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
    },
    [commentLookup, commentReferences, selectedPositions]
  );

  const hasSelectedComments = React.useMemo(
    () => Object.keys(commentLookup)
      .some(pos => selectedPositions.includes(parseInt(pos))),
    [commentLookup, selectedPositions]
  );

  const toggleDisplay = React.useCallback(
    () => {
      if (!expanded) {
        document.body.style.overflow = 'hidden';
      }
      else {
        scrollableRef.current.scrollTo({top: 0});
        document.body.style.overflow = defaultBodyOverflow;
      }
      setExpanded(!expanded);
    },
    [expanded, defaultBodyOverflow]
  );

  return <div
   className={style['footer-container']}
   data-expanded={hasSelectedComments ? expanded : false}>
    <section
     className={style.footer}>
      <button
       className={style["toggle-button"]}
       disabled={!hasSelectedComments}
       onClick={toggleDisplay}>
        {expanded ? <FaArrowDown /> : <FaArrowUp />}
        {expanded ? 'Less' : 'More'}
      </button>
      <div className={style.scrollable} ref={scrollableRef}>
        <Markdown
         disableHeadingTagAnchor
         {...{refDataLoader}}>
          {commentMdText}
        </Markdown>
      </div>
    </section>
  </div>;
}
