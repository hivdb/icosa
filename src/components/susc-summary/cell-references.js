import React from 'react';
import PropTypes from 'prop-types';
import createGlobalState from 'use-persisted-state/src/createGlobalState';
import {FaEllipsisH} from '@react-icons/all-files/fa/FaEllipsisH';
import Link from '../link';
import ExtLink from '../link/external';
import {RefLink} from '../references';

import {refShape} from './prop-types';
import style from './style.module.scss';

const GLOBAL_STATE_KEY = '--susc-summary-toggle-cell-references';


function useToggleExpansion() {
  const globalState = React.useRef(null);
  const [expansion, setExpansion] = React.useState(false);
  React.useEffect(
    () => {
      globalState.current = createGlobalState(
        GLOBAL_STATE_KEY,
        setExpansion,
        false
      );
      return () => {
        globalState.current.deregister();
      };
    },
    []
  );
  const globalToggleExpansion = React.useCallback(
    () => {
      setExpansion(!expansion);
      globalState.current.emit(!expansion);
    },
    [expansion]
  );
  return [expansion, globalToggleExpansion];
}


LabelReferences.propTypes = {
  children: PropTypes.node.isRequired
};

LabelReferences.defaultProps = {
  children: 'References'
};


export function LabelReferences({children}) {
  const [expansion, toggleExpansion] = useToggleExpansion();
  const onClick = React.useCallback(
    e => {
      e.preventDefault();
      toggleExpansion();
    },
    [toggleExpansion]
  );
  return <>
    {children}{' '}
    <a
     className={style['toggle-ref-expansion']}
     onClick={onClick}
     href="#toggle-ref-expansion">
      ({expansion ? 'show less' : 'show more'})
    </a>
  </>;
}


CellReferences.propTypes = {
  refs: PropTypes.arrayOf(refShape.isRequired).isRequired,
  openRefInNewWindow: PropTypes.bool.isRequired
};

CellReferences.defaultProps = {
  openRefInNewWindow: true
};

export default function CellReferences({refs, openRefInNewWindow}) {
  const [expansion, toggleExpansion] = useToggleExpansion();
  return <div className={style['cell-references']}>
    <ol data-expanded={expansion}>
      {refs.map(({refName}) => <li key={refName}>
        {openRefInNewWindow ?
          <ExtLink href={`/search-drdb/?article=${refName}`}>
            {refName}
          </ExtLink> :
          <Link to={`/search-drdb/?article=${refName}`}>
            {refName}
          </Link>}
        <RefLink name={refName} />
      </li>)}
    </ol>
    {refs.length > 2 && !expansion ?
      <button
       className={style['toggle-expansion']}
       onClick={toggleExpansion}>
        <FaEllipsisH />
      </button> : null}
  </div>;
}
