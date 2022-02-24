import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import {mutationShape} from './prop-types';
import shortenMutationList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';


MismatchMutations.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      variant: PropTypes.shape({
        name: PropTypes.string.isRequired
      }),
      variantMatchingMutations: PropTypes.arrayOf(
        mutationShape.isRequired
      ),
      variantExtraMutations: PropTypes.arrayOf(
        mutationShape.isRequired
      ),
      variantMissingMutations: PropTypes.arrayOf(
        mutationShape.isRequired
      )
    }).isRequired
  ).isRequired
};


export default function MismatchMutations({
  rows
}) {
  const variantRows = React.useMemo(() => rows
    .filter(({variant}) => (variant !== null))
    .map(({
      variant: {name},
      variantMatchingMutations,
      variantExtraMutations,
      variantMissingMutations
    }) => {
      const matchingMutations = shortenMutationList(variantMatchingMutations)
        .map(({text}) => text);
      const extraMutations = shortenMutationList(variantExtraMutations)
        .map(({text}) => text);
      const missingMutations = shortenMutationList(variantMissingMutations)
        .map(({text}) => text);
      return {
        variantName: name,
        matchingMutations,
        extraMutations,
        missingMutations
      };
    }), [rows]);
  if (variantRows.length === 0) {
    return null;
  }
  return <div>
    The submitted sequence has the following differences
    from the following prototype {pluralize('variants', variantRows.length)}:
    <ul>
      {variantRows.map(({
        variantName,
        matchingMutations,
        extraMutations,
        missingMutations
      }, idx) => <li key={idx}>
        <strong>{variantName}</strong> (matching <>
          <span className={style['match-muts']}>
            {matchingMutations.join(' + ')}
          </span>
        </>){': '}
        {missingMutations.length > 0 ? <>
          {pluralize('additional mutation', missingMutations.length, true)}{' '}
          <span className={style['add-muts']}>
            {missingMutations.join(' + ')}
          </span>
        </> : null}
        {extraMutations.length +
          missingMutations.length === 0 ? 'No difference observed' : null}
        {extraMutations.length > 0 &&
          missingMutations.length > 0 ? '; ' : null}
        {extraMutations.length > 0 ? <>
          {pluralize('missing mutation', extraMutations.length, true)}{' '}
          <span className={style['mis-muts']}>
            {extraMutations.join(' + ')}
          </span>
        </> : null}.
      </li>)}
    </ul>
  </div>;

}
