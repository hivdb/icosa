import React from 'react';
import PropTypes from 'prop-types';
import Link from '../link';
import ExtLink from '../link/external';
import {RefLink} from '../references';

import {refShape} from './prop-types';
import style from './style.module.scss';


function CellReferences({refs, openRefInNewWindow}) {
  return <ol className={style['cell-references']}>
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
  </ol>;
}

CellReferences.propTypes = {
  refs: PropTypes.arrayOf(refShape.isRequired).isRequired,
  openRefInNewWindow: PropTypes.bool.isRequired
};

CellReferences.defaultProps = {
  openRefInNewWindow: true
};

export default CellReferences;
