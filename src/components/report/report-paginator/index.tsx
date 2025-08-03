import React from 'react';
import classNames from 'classnames';
import Select from '../../select';

import useScrollObserver from '../../../utils/use-scroll-observer';

import Button from './button';
import style from './style.module.scss';


interface InputObj {
  name?: string;
  header?: string;
}

function getUniqKey(inputObj: InputObj): string {
  if ('name' in inputObj && inputObj.name) {
    return inputObj.name;
  }
  else {
    return inputObj.header as string;
  }
}


interface ReportPaginatorProps {
  inputObjs: InputObj[];
  currentSelected: {index: number; name: string};
  onSelect: (value: string) => void;
  children?: React.ReactNode;
}

/**
 * Render the paginator component which allows selecting among sequence inputs.
 *
 * @param props - Component props.
 * @returns React element containing paginator UI.
 */
function ReportPaginator({
  inputObjs,
  currentSelected,
  onSelect,
  children: extras
}: ReportPaginatorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
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

  const handleChange = React.useCallback(
    ({value}: {value: string}) => onSelect(value),
    [onSelect]
  );

  const options = React.useMemo(
    () => inputObjs.map(
      (inputObj, idx) => ({
        // key: getUniqKey(inputObj),
        label: `${idx + 1}. ${getUniqKey(inputObj)}`,
        value: getUniqKey(inputObj)
      })
    ),
    [inputObjs]
  );

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
      {/*<Paginator
       inverseColor={fixed}
       footnote={<>
         This submission contains {inputObjs.length} sequences.
       </>}
       currentSelected={currentSelected.name}>
        {children}
      </Paginator>*/}
      <div className={style['dropdown-container']}>
        <Select
         isSearchable
         options={options}
         className={style['report-paginator-select']}
         name="sequence-select"
         classNamePrefix="report-paginator-select"
         placeholder="Select a sequence"
         onChange={handleChange}
         value={options[currentSelected.index]} />
      </div>
    </div>
  );

}

/**
 * Options for {@link useReportPaginator}.
 */
interface UseReportPaginatorOptions {
  inputObjs: InputObj[];
  loaded: boolean;
  output?: string;
  currentSelected: {index: number; name: string};
  fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
  children?: React.ReactNode;
}

/**
 * Hook wiring up pagination controls with scroll observation for reports.
 *
 * @param options - Configuration including data sources and callbacks.
 * @returns Handlers for observing nodes and the paginator element.
 */
function useReportPaginator({
  inputObjs,
  loaded,
  output,
  currentSelected,
  fetchAnother,
  children
}: UseReportPaginatorOptions) {
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
    (name: string) => scrollTo(name, resetPaginatorScrollOffset, false, true),
    [scrollTo, resetPaginatorScrollOffset]
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
