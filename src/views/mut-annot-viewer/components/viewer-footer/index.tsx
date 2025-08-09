import React from 'react';
import {IoClose} from '@react-icons/all-files/io5/IoClose';

import Markdown from '../../../../components/markdown';
import {useNewWindow} from '../../../../components/new-window';
import ProteinViewer from '../../../../components/protein-viewer';
import type {ProteinView} from '../../../../components/protein-viewer';

import style from './style.module.scss';


interface UseFootnoteArgs {
  selectedPositions: number[];
  commentLookup: Record<number, {comment: string[]}>;
  commentReferences: string;
}

/**
 * Manage state for the footnote panel including visibility and markdown text.
 */
export function useFootnote({
  selectedPositions,
  commentLookup,
  commentReferences
}: UseFootnoteArgs) {
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
      const buffer: string[] = [];
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
  ] as const;
}


interface ViewerFooterProps {
  sequence: string;
  refDataLoader?: () => Promise<any>;
  selectedPositions: number[];
  proteinViews?: ProteinView[];
  children: string;
  onClose: () => void;
}

/**
 * Footer section showing comments and optional protein viewer.
 */
export default function ViewerFooter(props: ViewerFooterProps) {
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
  const scrollableRef = React.useRef<HTMLDivElement>(null);
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
               backgroundColor="#f4f4f4"
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
