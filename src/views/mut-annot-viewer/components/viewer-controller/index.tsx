import React from 'react';
import makeClassNames from 'classnames';

import type {
  FragmentOption,
  AnnotCategory,
  CurAnnotNameLookup,
  Annotation,
  SeqViewerSize
} from '../../prop-types';

import style from './style.module.scss';
import SizeController from './size-controller';
import FragmentDropdown from './fragment-dropdown';
import AnnotCategory from './annot-category';
import FootnoteOpener from './footnote-opener';

/** Props for {@link ViewerController}. */
interface ViewerControllerProps {
  className?: string;
  fragmentOptions: FragmentOption[];
  seqFragment: number[];
  annotCategories: AnnotCategory[];
  curAnnotNameLookup: CurAnnotNameLookup;
  annotations: Annotation[];
  seqViewerSize: SeqViewerSize;
  hasFootnote: boolean;
  onCurAnnotNameLookupChange: (lookup: CurAnnotNameLookup) => void;
  onSeqFragmentChange: (fragmentName: string) => void;
  onSeqViewerSizeChange: (size: SeqViewerSize) => void;
  onOpenFootnote: () => void;
}

/**
 * Render controls for selecting fragments and annotations.
 */
export default function ViewerController({
  className,
  fragmentOptions,
  seqFragment,
  annotCategories,
  curAnnotNameLookup,
  annotations,
  seqViewerSize,
  hasFootnote,
  onCurAnnotNameLookupChange,
  onSeqViewerSizeChange,
  onSeqFragmentChange,
  onOpenFootnote
}: ViewerControllerProps) {

  const mergedClassName = makeClassNames(
    style['viewer-controller'],
    className
  );

  const handleCurAnnotNamesChange = React.useCallback(
    catName => newCurAnnotNames => {
      const curAnnotNames = curAnnotNameLookup[catName];
      if (newCurAnnotNames !== curAnnotNames) {
        curAnnotNameLookup[catName] = newCurAnnotNames;
        onCurAnnotNameLookupChange({...curAnnotNameLookup});
      }
    },
    [curAnnotNameLookup, onCurAnnotNameLookupChange]
  );

  return React.useMemo(
    () => (
      <div className={mergedClassName}>
        <SizeController
         size={seqViewerSize}
         onChange={onSeqViewerSizeChange} />
        <FootnoteOpener
         disabled={!hasFootnote}
         onClick={onOpenFootnote} />
        <FragmentDropdown
         fragmentOptions={fragmentOptions}
         seqFragment={seqFragment}
         onChange={onSeqFragmentChange} />
        {annotCategories.map((cat, idx) => (
          <AnnotCategory
           key={idx}
           annotCategory={cat}
           curAnnotNames={curAnnotNameLookup[cat.name]}
           annotations={annotations}
           onChange={handleCurAnnotNamesChange(cat.name)} />
        ))}
      </div>
    ),
    [
      annotCategories,
      annotations,
      curAnnotNameLookup,
      fragmentOptions,
      handleCurAnnotNamesChange,
      mergedClassName,
      onSeqFragmentChange,
      onSeqViewerSizeChange,
      seqFragment,
      seqViewerSize,
      hasFootnote,
      onOpenFootnote
    ]
  );
}
