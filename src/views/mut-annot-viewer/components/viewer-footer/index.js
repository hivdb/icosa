import React from 'react';
import PropTypes from 'prop-types';
import {IoClose} from '@react-icons/all-files/io5/IoClose';
import NewWindow from 'react-new-window';

import Markdown from '../../../../components/markdown';

import style from './style.module.scss';


export function useFootnote({
  selectedPositions,
  commentLookup,
  commentReferences
}) {
  const [showFootnote, setShowFootnote] = React.useState(false);
  const openFn = React.useCallback(
    () => setShowFootnote(true),
    []
  );

  const closeFn = React.useCallback(
    () => setShowFootnote(false),
    []
  );

  const commentMdText = React.useMemo(
    () => {
      const buffer = [];
      for (const pos of selectedPositions) {
        if (!(pos in commentLookup)) {
          continue;
        }
        const {comment} = commentLookup[pos];
        for (const cmt of comment) {
          buffer.push(`- ${cmt}`);
        }
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

  return [
    commentMdText,
    hasSelectedComments,
    showFootnote,
    openFn,
    closeFn
  ];
}


ViewerFooter.propTypes = {
  refDataLoader: PropTypes.func,
  children: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default function ViewerFooter({
  refDataLoader,
  children,
  onClose
}) {
  const scrollableRef = React.useRef();

  return <NewWindow
   name="mut-annot-footer-tab"
   center="no"
   onUnload={onClose}
   features={{
     left: 50,
     top: 50,
     width: 800,
     height: 600
   }}>
    <div className={style['footer-container']}>
      <section
       className={style.footer}>
        <button
         onClick={onClose}
         className={style["toggle-button"]}>
          <IoClose />
          Close
        </button>
        <div className={style.scrollable} ref={scrollableRef}>
          <Markdown
           disableHeadingTagAnchor
           {...{refDataLoader}}>
            {children}
          </Markdown>
        </div>
      </section>
    </div>
  </NewWindow>;
}
