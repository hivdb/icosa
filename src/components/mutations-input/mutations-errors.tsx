import React from 'react';
import classNames from 'classnames';

import { sanitizeMutations } from '../../utils/mutation';

import style from './style.module.scss';
import linkStyle from '../link/style.module.scss';

/** Shape describing a mutation error entry */
export interface MutationError {
  /** Original mutation text */
  text: string;
  /** List of validation error messages */
  errors: string[];
}

/** Props for the {@link MutationsErrors} presentation component */
export interface MutationsErrorsProps {
  /** Restrict display to a specific gene */
  geneOnly?: string;
  /** Aggregated validation errors */
  allErrors: MutationError[];
  /** Optional parent className for BEM-style selectors */
  parentClassName?: string;
  /** Callback for removing all problematic mutations */
  onAutoClean(e: React.MouseEvent<HTMLAnchorElement>): void;
}

/**
 * Present a formatted list of mutation validation errors with a convenience
 * link to remove all offending mutations.
 *
 * @param props - {@link MutationsErrorsProps}
 * @returns JSX block listing all errors.
 */
export function MutationsErrors({
  geneOnly,
  allErrors,
  onAutoClean,
  parentClassName
}: MutationsErrorsProps): React.JSX.Element {
  const className = parentClassName ? `${parentClassName}-errors` : null;

  return (
    <div
      data-display={allErrors.length > 0}
      className={classNames(style['mutations-errors'], className)}
      style={{
        '--error-rows': allErrors.reduce(
          (acc, { errors }) => acc + errors.length + 1,
          0
        )
      } as React.CSSProperties}
    >
      <p>
        Please fix following errors: (
        <a
          className={linkStyle.link}
          onClick={onAutoClean}
          href="#remove-all"
        >
          remove all problematic mutations
        </a>
        )
      </p>
      <ul>
        {allErrors.map(({ text, errors }, idx) => (
          <li key={idx}>
            <span
              data-error="true"
              className={classNames(
                style['mutations-tagsinput-tag'],
                parentClassName ? `${parentClassName}-tagsinput-tag` : null
              )}
            >
              {geneOnly ? text.replace(/^[^:]+:/, '') : text}
            </span>
            :
            <ul>
              {errors.map((err, jdx) => (
                <li key={jdx}>{err}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Options for {@link useMutationErrors} hook */
export interface UseMutationErrorsOptions {
  geneOnly?: string;
  allowPositions?: boolean;
  defaultGene?: string;
  geneSynonyms?: Record<string, string>;
  geneReferences?: Record<string, string>;
  messages: Record<string, string>;
  parentClassName?: string;
  mutations: string[];
  onChange(mutations: string[]): void;
  onPreventSubmit(): void;
}

/**
 * Hook wrapping {@link MutationsErrors} that performs validation and renders
 * the component when errors are present.
 *
 * @param options - {@link UseMutationErrorsOptions}
 * @returns Rendered error list or `null` if no errors.
 */
export default function useMutationErrors({
  geneOnly,
  allowPositions,
  defaultGene,
  geneSynonyms = {},
  geneReferences = {},
  messages,
  parentClassName,
  mutations,
  onChange,
  onPreventSubmit
}: UseMutationErrorsOptions): React.JSX.Element {
  const [, allErrors] = React.useMemo(
    () =>
      sanitizeMutations(mutations, {
        allowPositions,
        defaultGene: geneOnly || defaultGene,
        geneSynonyms,
        geneReferences,
        messages
      }),
    [
      allowPositions,
      defaultGene,
      geneOnly,
      geneReferences,
      geneSynonyms,
      messages,
      mutations
    ]
  );

  React.useEffect(() => {
    if (allErrors.length > 0) {
      onPreventSubmit();
    }
  }, [allErrors, onPreventSubmit]);

  const handleRemoveAllErrors = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const [sanitized] = sanitizeMutations(mutations, {
        allowPositions,
        defaultGene: geneOnly || defaultGene,
        geneSynonyms,
        geneReferences,
        messages,
        removeErrors: true
      });
      onChange(sanitized);
    },
    [
      defaultGene,
      allowPositions,
      geneOnly,
      geneReferences,
      geneSynonyms,
      mutations,
      onChange
    ]
  );

  return (
    <MutationsErrors
      geneOnly={geneOnly}
      allErrors={allErrors}
      parentClassName={parentClassName}
      onAutoClean={handleRemoveAllErrors}
    />
  );
}
