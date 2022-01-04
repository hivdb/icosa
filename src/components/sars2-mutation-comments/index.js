import React from 'react';
import PropTypes from 'prop-types';
import Markdown from '../markdown';
import shortenMutList from '../../utils/shorten-mutation-list';
import createPersistedReducer from '../../utils/use-persisted-reducer';
import CheckboxInput from '../checkbox-input';

import style from './style.module.scss';


const useDisplayRefLink = createPersistedReducer(
  '--sierra-report-display-reflink-opt'
);


MutationComment.propTypes = {
  triggeredMutations: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      text: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  comment: PropTypes.string.isRequired
};

function MutationComment({triggeredMutations, comment}) {
  const muts = shortenMutList(triggeredMutations).map(({
    gene: {name: geneName},
    text
  }) => (
    geneName === 'S' ? text : `${geneName}:${text}`
  ));
  return <li key={muts.join('+')}>
    <div className={style['triggered-mutations']}>
      {muts.map(mut => <React.Fragment key={mut}>
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


SARS2MutationComments.propTypes = {
  mutationComments: PropTypes.arrayOf(
    PropTypes.shape(MutationComment.propTypes).isRequired
  ).isRequired
};

function SARS2MutationComments({mutationComments}) {
  const [
    displayRefLink,
    toggleDisplayRefLink
  ] = useDisplayRefLink(display => !display, true);
  if (mutationComments.length > 0) {
    return <div className={style['mutation-comments-container']}>
      <ul
       className={style['mutation-comments']}
       data-display-reflink={displayRefLink}>
        {mutationComments.map((cmtObj, idx) => (
          <MutationComment {...cmtObj} key={idx} />
        ))}
      </ul>
      <div className={style['mutation-comments-options']}>
        <CheckboxInput
         id="toggle-display-reflink"
         name="toggle-display-reflink"
         value="display"
         onChange={toggleDisplayRefLink}
         checked={!displayRefLink}>
          Hide all reference footnotes
        </CheckboxInput>
      </div>
    </div>;
  }
  else {
    return "No comment are available.";
  }
}

SARS2MutationComments.propTypes = {
  mutationComments: PropTypes.arrayOf(
    PropTypes.shape({
      triggeredMutations: PropTypes.array.isRequired,
      comment: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
};

export default React.memo(SARS2MutationComments);
