import React from 'react';
import PropTypes from 'prop-types';
import {
  BiChevronLeft as ArrowLeft
} from '@react-icons/all-files/bi/BiChevronLeft';
import {
  BiChevronRight as ArrowRight
} from '@react-icons/all-files/bi/BiChevronRight';

import style from './style.module.scss';

export default style;


ToggleTabs.propTypes = {
  expansion: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

function ToggleTabs({expansion, onToggle}) {
  return <div className={style['toggle-tabs']}>
    <button
     onClick={onToggle}
     role="switch"
     aria-checked={expansion}>
      {expansion ? <ArrowLeft /> : <ArrowRight />}
    </button>

  </div>;
}


export function useToggleTabs(hideIfNarrowerThan = 900) {
  const defaultExpansion = window.innerWidth >= hideIfNarrowerThan;
  const [expansion, setExpansion] = React.useState(defaultExpansion);

  const resetExpansion = React.useCallback(
    () => {
      const newExp = window.innerWidth >= hideIfNarrowerThan;
      setExpansion(newExp);
    },
    [hideIfNarrowerThan]
  );

  React.useEffect(
    () => {
      window.addEventListener('resize', resetExpansion);
      return () => window.removeEventListener('resize', resetExpansion);
    },
    [resetExpansion]
  );

  const onToggle = React.useCallback(
    () => setExpansion(!expansion),
    [expansion]
  );

  return [
    expansion,
    <ToggleTabs {...{expansion, onToggle}} />,
    resetExpansion
  ];

}
