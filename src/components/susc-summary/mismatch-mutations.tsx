import React from 'react';
import pluralize from 'pluralize';
import shortenMutationList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';
import type { Mutation, Variant } from './types';

/**
 * Data structure representing mismatch information for a variant.
 */
export interface MismatchRow {
  variant: Variant | null;
  variantMatchingMutations: Mutation[];
  variantExtraMutations: Mutation[];
  variantMissingMutations: Mutation[];
}

/**
 * Props for {@link MismatchMutations} component.
 *
 * @property rows - Rows containing mismatch data for each variant.
 */
export interface MismatchMutationsProps {
  rows: MismatchRow[];
}

/**
 * Display differences between submitted sequences and prototype variants.
 */
export default function MismatchMutations({ rows }: MismatchMutationsProps) {
  const variantRows = React.useMemo(
      () =>
        rows
          .filter((row): row is MismatchRow & {variant: Variant} => row.variant !== null)
          .map(({
            variant,
            variantMatchingMutations,
            variantExtraMutations,
            variantMissingMutations,
          }) => {
            const {name} = variant;
            const matchingMutations = shortenMutationList(
              variantMatchingMutations
            ).map(({ text }) => text);
          const extraMutations = shortenMutationList(variantExtraMutations).map(
            ({ text }) => text
          );
          const missingMutations = shortenMutationList(
            variantMissingMutations
          ).map(({ text }) => text);
          return {
            variantName: name,
            matchingMutations,
            extraMutations,
            missingMutations,
          };
        }),
    [rows]
  );
  if (variantRows.length === 0) {
    return null;
  }
  return (
    <div>
      The submitted sequence has the following differences from the following
      prototype {pluralize('variants', variantRows.length)}:
      <ul>
        {variantRows.map(
          ({ variantName, matchingMutations, extraMutations, missingMutations }, idx) => (
            <li key={idx}>
              <strong>{variantName}</strong> (match <>
                <span className={style['match-muts']}>
                  {matchingMutations.join(' + ')}
                </span>
              </>)
              {': '}
              {missingMutations.length > 0 ? (
                <>
                  {pluralize('additional mutation', missingMutations.length, true)}{' '}
                  <span className={style['add-muts']}>
                    {missingMutations.join(' + ')}
                  </span>
                </>
              ) : null}
              {extraMutations.length + missingMutations.length === 0
                ? 'No difference observed'
                : null}
              {extraMutations.length > 0 && missingMutations.length > 0 ? '; ' : null}
              {extraMutations.length > 0 ? (
                <>
                  {pluralize('missing mutation', extraMutations.length, true)}{' '}
                  <span className={style['mis-muts']}>
                    {extraMutations.join(' + ')}
                  </span>
                </>
              ) : null}
              .
            </li>
          )
        )}
      </ul>
    </div>
  );
}
