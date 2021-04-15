import React from 'react';
import PropTypes from 'prop-types';

import Paginator from '../paginator';

import style from './style.module.scss';


function SeqReadsSidebar({
  allSequenceReads,
  currentSelected,
  onSelect
}) {
  const containerRef = React.useRef();
  const [fixed, handleWindowScroll] = React.useReducer(
    () => {
      const {top} = containerRef.current.getBoundingClientRect();
      const newFixed = top === 0;
      return newFixed;
    },
    false
  );

  React.useEffect(() => {
    window.addEventListener('scroll', handleWindowScroll, false);
    return () => (
      window.removeEventListener('scroll', handleWindowScroll, false)
    );
  }, [handleWindowScroll]);

  const children = React.useMemo(() => {
    return allSequenceReads
      .map((seqReads, idx) => (
        <Paginator.Item
         key={idx}
         name={seqReads.name}
         href={`?name=${seqReads.name}`}
         onClick={(e) => handleClick(e, seqReads)}>
          {seqReads.name}
        </Paginator.Item>
      ));

    function handleClick(e, seqReads) {
      e && e.preventDefault();
      onSelect && onSelect(seqReads);
    }
  }, [onSelect, allSequenceReads]);

  return (
    <div
     ref={containerRef}
     data-fixed={fixed}
     className={style['sequence-paginator-container']}>
      <Paginator
       footnote={<>
         This submission contains {allSequenceReads.length} sequences.
       </>}
       currentSelected={currentSelected.name}>
        {children}
      </Paginator>
    </div>
  );

}

SeqReadsSidebar.propTypes = {
  allSequenceReads: PropTypes.array.isRequired,
  currentSelected: PropTypes.shape({
    index: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  onSelect: PropTypes.func
};

export default SeqReadsSidebar;
