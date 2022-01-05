import React from 'react';
import PropTypes from 'prop-types';
import shortenMutationList from '../../utils/shorten-mutation-list';

import {getRowKey} from './funcs';
import {mutationShape} from './prop-types';
import style from './style.module.scss';


function CellMutations({mutations, variant}) {
  const shortMutations = shortenMutationList(mutations);
  return (
    <div
     key={getRowKey({mutations})}
     className={style['cell-variants']}>
      {variant ? variant.name : <div className={style['mutations']}>
        {shortMutations.map(({text}, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ?
              <span className={style['inline-divider']}> + </span> : null}
            <span className={style['mutation']}>
              {text}
            </span>
          </React.Fragment>
        ))}
      </div>}
    </div>
  );
}

CellMutations.propTypes = {
  mutations: PropTypes.arrayOf(mutationShape.isRequired).isRequired,
  variant: PropTypes.shape({
    name: PropTypes.string.isRequired
  })
};


export default CellMutations;
