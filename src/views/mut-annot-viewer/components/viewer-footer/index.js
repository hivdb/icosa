import React from 'react';
import PropTypes from 'prop-types';
import {IoClose} from '@react-icons/all-files/io5/IoClose';

import Markdown from '../../../../components/markdown';
import {useNewWindow} from '../../../../components/new-window';
import ProteinViewer, {
  proteinViewShape
} from '../../../../components/protein-viewer';

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
        return (
          `\n## Comments\n\n` +
          `\n${buffer.join('\n')}\n\n${commentReferences}`
        );
      }
      return 'No comment was found for selected position(s).';
    },
    [commentLookup, commentReferences, selectedPositions]
  );

  const hasSelectedPos = selectedPositions.length > 0;

  return [
    commentMdText,
    hasSelectedPos,
    showFootnote,
    openFn,
    closeFn
  ];
}


ViewerFooter.propTypes = {
  sequence: PropTypes.string.isRequired,
  refDataLoader: PropTypes.func,
  selectedPositions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  proteinViews: PropTypes.arrayOf(
    proteinViewShape.isRequired
  ),
  children: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default function ViewerFooter(props) {
  const {
    sequence,
    refDataLoader,
    selectedPositions,
    proteinViews,
    children,
    onClose
  } = props;
  const {isChild} = useNewWindow(props, {
    name: 'mut-annot-footer-tab',
    onUnload: props.onClose,
    features: "left=50,top=50,width=960,height=960"
  });
  const scrollableRef = React.useRef();
  const positionsForProteinViewer = React.useMemo(
    () => isChild && proteinViews ? selectedPositions.map(
      position => ({
        position,
        label: `${sequence[position - 1]}${position}`,
        bgColor: 0x235fc5,
        color: 'white'
      })
    ) : null,
    [proteinViews, selectedPositions, sequence, isChild]
  );

  return <>
    {isChild ?
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
            {proteinViews ? <div className={style['protein-viewer']}>
              <ProteinViewer
               width={400}
               height={400}
               views={proteinViews}
               positions={positionsForProteinViewer} />
            </div> : null}
            <Markdown
             disableHeadingTagAnchor
             {...{refDataLoader}}>
              {children}
            </Markdown>
          </div>
        </section>
      </div> : null}
  </>;
}
