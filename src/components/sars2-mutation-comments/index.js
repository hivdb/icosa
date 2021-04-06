import React from 'react';
import PropTypes from 'prop-types';
import Markdown from '../markdown';
import shortenMutList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';


function MutationComment({triggeredMutations, comment}) {
  const muts = shortenMutList(triggeredMutations).map(({
    gene: {name: geneName},
    text
  }) => (
    geneName === 'S' ? text : `${geneName}:${text}`
  ));
  return <li key={muts.join('+')}>
    <div className={style['triggered-mutations']}>
      {muts.map((mut, idx) => <React.Fragment key={mut}>
        <span className={style['mut-sep']}>·</span>
        {mut}
      </React.Fragment>)}
    </div>
    <div className={style['mutation-comment']}>
      <Markdown escapeHtml={false} displayReferences={false}>
        {comment}
      </Markdown>
    </div>
  </li>;
}


function SARS2MutationComments({mutationComments}) {
  if (mutationComments.length > 0) {
    return <ul className={style['mutation-comments']}>
      {mutationComments.map((cmtObj, idx) => (
        <MutationComment {...cmtObj} key={idx} />
      ))}
    </ul>;
  }
  else {
    return "No comment are available.";
  }
}

SARS2MutationComments.propTypes = {
  mutationComments: PropTypes.arrayOf(
    PropTypes.shape({
      triggeredMutations: PropTypes.object.isRequired,
      comment: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
};

export default SARS2MutationComments;
