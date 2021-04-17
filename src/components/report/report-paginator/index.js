import React from 'react';
import PropTypes from 'prop-types';

import Paginator from '../../paginator';
import useScrollObserver from '../../../utils/use-scroll-observer';

import style from './style.module.scss';


function getUniqKey(inputObj) {
  if ('name' in inputObj) {
    return inputObj.name;
  }
  else {
    return inputObj.header;
  }
}


function ReportPaginator({
  inputObjs,
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
    return inputObjs
      .map((inputObj, idx) => (
        <Paginator.Item
         key={idx}
         name={getUniqKey(inputObj)}
         href={`?name=${getUniqKey(inputObj)}`}
         onClick={(e) => handleClick(e, getUniqKey(inputObj))}>
          {getUniqKey(inputObj)}
        </Paginator.Item>
      ));

    function handleClick(e, name) {
      e && e.preventDefault();
      onSelect && onSelect(name);
    }
  }, [onSelect, inputObjs]);

  return (
    <div
     ref={containerRef}
     data-fixed={fixed}
     className={style['report-paginator-container']}>
      <Paginator
       inverseColor={fixed}
       footnote={<>
         This submission contains {inputObjs.length} sequences.
       </>}
       currentSelected={currentSelected.name}>
        {children}
      </Paginator>
    </div>
  );

}

ReportPaginator.propTypes = {
  inputObjs: PropTypes.array,
  currentSelected: PropTypes.shape({
    index: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  onSelect: PropTypes.func
};

export default function useReportPaginator({
  inputObjs,
  loaded,
  output,
  currentSelected,
  onSelect
}) {
  const resetPaginatorScrollOffset = React.useCallback(
    () => {
      const event = new Event('--sierra-paginator-reset-scroll');
      window.dispatchEvent(event);
    },
    []
  );

  const onSelectItem = React.useCallback(
    name => {
      onSelect({name});
      resetPaginatorScrollOffset();
    },
    [onSelect, resetPaginatorScrollOffset]
  );

  const {
    onObserve,
    onDisconnect,
    preventScrollObserver,
    resetScrollObserver,
    scrollTo
  } = useScrollObserver({
    loaded,
    output,
    currentSelected,
    onSelectItem
  });

  const onPaginatorSelect = React.useCallback(
    async name => {
      preventScrollObserver();
      await onSelect({name});
      scrollTo(name, resetScrollObserver);
    },
    [
      preventScrollObserver,
      onSelect,
      scrollTo,
      resetScrollObserver
    ]
  );

  return {
    onObserve,
    onDisconnect,
    paginator: (
      <ReportPaginator
       currentSelected={currentSelected}
       onSelect={onPaginatorSelect}
       inputObjs={inputObjs} />
    )
  };
}
