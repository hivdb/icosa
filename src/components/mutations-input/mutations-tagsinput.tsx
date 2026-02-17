import React from 'react';
import classNames from 'classnames';
import TagsInput from 'react-tagsinput';

import {
  parseMutation,
  sanitizeMutations,
  parseAndValidateMutation
} from '../../utils/mutation';

import useMutationsErrors from './mutations-errors';
import type { MutationsConfig } from './types';
import style from './style.module.scss';

/** Props for {@link MutationsTagsInput} */
export interface MutationsTagsInputProps {
  /** Configuration containing mutation parsing options */
  config: Pick<MutationsConfig, 'allowPositions' | 'mutationDefaultGene' | 'geneSynonyms' | 'geneReferences' | 'messages'>;
  /** Restrict inputs to a specific gene */
  geneOnly?: string;
  /** Current list of mutation strings */
  mutations: string[];
  /** Optional parent className for BEM modifiers */
  parentClassName?: string;
  /** Callback when mutations change */
  onChange(payload: { mutations: string[] }, preventSubmit: boolean): void;
}

/**
 * Interactive tags input for entering mutation strings. Handles validation
 * and delegates error rendering to {@link useMutationsErrors}.
 *
 * @param props - {@link MutationsTagsInputProps}
 * @returns Container element with tag input and error list.
 */
export default function MutationsTagsInput({
  config,
  geneOnly,
  mutations,
  onChange,
  parentClassName
}: MutationsTagsInputProps): React.JSX.Element {
  const {
    allowPositions = false,
    mutationDefaultGene,
    geneSynonyms = {},
    geneReferences,
    messages
  } = config;

  const placeholder =
    messages['pattern-analysis-input-placeholder'] ||
    '<pattern-analysis-input-placeholder>';

  const className = parentClassName ? `${parentClassName}-tagsinput` : null;

  const [filteredMutations, otherMutations] = React.useMemo(() => {
    if (!geneOnly) {
      return [mutations, []];
    }
    const mutObjs = mutations.map(m => parseMutation(m));
    return [
      mutations.filter((_, idx) => mutObjs[idx][3] === geneOnly),
      mutations.filter((_, idx) => mutObjs[idx][3] !== geneOnly)
    ];
  }, [geneOnly, mutations]);

  const handlePreventSubmit = React.useCallback(
    () => onChange({ mutations }, true),
    [onChange, mutations]
  );

  const handleChange = React.useCallback(
    (filtered: string[]) => {
      let resultMutations: string[];
      if (geneOnly) {
        resultMutations = [
          ...filtered.map(mut =>
            mut.includes(':') ? mut : `${geneOnly}:${mut}`
          ),
          ...otherMutations
        ];
      } else {
        resultMutations = filtered;
      }
      const [sanitized, allErrors] = sanitizeMutations(resultMutations, {
        allowPositions,
        defaultGene: mutationDefaultGene,
        geneSynonyms,
        geneReferences,
        messages
      });
      onChange({ mutations: sanitized }, allErrors.length > 0);
    },
    [
      geneOnly,
      allowPositions,
      geneReferences,
      geneSynonyms,
      mutationDefaultGene,
      onChange,
      otherMutations
    ]
  );

  const renderMutTag = React.useCallback(
    ({ tag, key, onRemove, classNameRemove, className: tagClass }: any) => {
      let { text, errors } = parseAndValidateMutation(tag, {
        allowPositions,
        defaultGene: geneOnly || mutationDefaultGene,
        geneSynonyms,
        geneReferences,
        messages
      });
      if (geneOnly) {
        const parts = text.split(':', 2);
        text = parts[parts.length - 1];
      }
      return (
        <span key={key} className={tagClass} data-error={errors.length > 0}>
          {text}
          <a
            href="#remove-mutation"
            className={classNameRemove}
            onClick={e => {
              e.preventDefault();
              onRemove(key);
            }}
          >
            {' x'}
          </a>
        </span>
      );
    },
    [
      geneOnly,
      allowPositions,
      mutationDefaultGene,
      geneSynonyms,
      geneReferences
    ]
  );

  const labelText = messages['pattern-analysis-input-label'];

  const errorsElement = useMutationsErrors({
    allowPositions,
    geneOnly,
    defaultGene: mutationDefaultGene,
    geneSynonyms,
    geneReferences,
    messages,
    mutations: filteredMutations,
    parentClassName,
    onChange: handleChange,
    onPreventSubmit: handlePreventSubmit
  });

  return (
    <div className={style['mutations-tagsinput-container']}>
      {labelText ? <label>{labelText}</label> : null}
      <TagsInput
        key="tagsInput"
        tabIndex={0}
        addKeys={[13, 32, 187, 188, 190]}
        addOnBlur
        addOnPaste
          pasteSplit={(data: string) => data.split(/[\s,;+.]+/g)}
        value={filteredMutations}
        renderTag={renderMutTag}
        inputProps={{
          placeholder,
          size: placeholder.length,
          className: classNames(
            style['mutations-tagsinput-input'],
            className ? `${className}-input` : null
          )
        }}
        className={classNames(style['mutations-tagsinput'], className)}
        focusedClassName={classNames(
          style['mutations-tagsinput-focused'],
          className ? `${className}-focused` : null
        )}
        tagProps={{
          className: classNames(
            style['mutations-tagsinput-tag'],
            className ? `${className}-tag` : null
          ),
          classNameRemove: classNames(
            style['mutations-tagsinput-remove'],
            className ? `${className}-tag` : null
          )
        }}
        onChange={handleChange}
      />
      {errorsElement}
    </div>
  );
}
