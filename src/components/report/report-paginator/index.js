import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Paginator from '../../paginator';
import useScrollObserver from '../../../utils/use-scroll-observer';

import Button from './button';
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
  onSelect,
  children: extras
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
      <div className={classNames(
        style['report-paginator-extras'],
        fixed ? style['inverse-color'] : null
      )}>
        {extras}
      </div>
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
    index: PropTypes.number,
    name: PropTypes.string
  }),
  onSelect: PropTypes.func,
  children: PropTypes.node
};


function useReportPaginator({
  inputObjs,
  loaded,
  output,
  currentSelected,
  fetchAnother,
  children
}) {
  const resetPaginatorScrollOffset = React.useCallback(
    () => {
      const event = new Event('--sierra-paginator-reset-scroll');
      window.dispatchEvent(event);
    },
    []
  );

  const {
    onObserve,
    onDisconnect,
    scrollTo
  } = useScrollObserver({
    loaded,
    disabled: output === 'printable',
    currentSelected,
    asyncLoadNewItem: fetchAnother,
    afterLoadNewItem: resetPaginatorScrollOffset
  });

  const onPaginatorSelect = React.useCallback(
    name => scrollTo(name, resetPaginatorScrollOffset),
    [
      scrollTo,
      resetPaginatorScrollOffset
    ]
  );

  return {
    onObserve,
    onDisconnect,
    paginator: (
      <ReportPaginator
       currentSelected={currentSelected}
       onSelect={onPaginatorSelect}
       inputObjs={inputObjs}
       children={children} />
    )
  };
}

useReportPaginator.Button = Button;

export default useReportPaginator;
