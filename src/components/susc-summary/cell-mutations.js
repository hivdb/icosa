import React from 'react';
import PropTypes from 'prop-types';
import shortenMutationList from '../../utils/shorten-mutation-list';

import {getRowKey} from './funcs';
import {mutationShape} from './prop-types';
import style from './style.module.scss';


function CellMutations({mutations, variants}) {
  const shortMutations = shortenMutationList(mutations);
  return (
    <div
     key={getRowKey({mutations})}
     className={style['cell-variants']}>
      <div className={style['mutations']}>
        {shortMutations.map(({text}, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ?
              <span className={style['inline-divider']}> + </span> : null}
            <span className={style['mutation']}>
              {text}
            </span>
          </React.Fragment>
        ))}
      </div>
      {variants.length > 0 ?
        <div className={style['variants']}>
          {variants.join('/')}
        </div> : null}
    </div>
  );
}

CellMutations.propTypes = {
  mutations: PropTypes.arrayOf(mutationShape.isRequired).isRequired,
  variants: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
};


export default CellMutations;
