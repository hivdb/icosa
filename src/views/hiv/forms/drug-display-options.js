import React from 'react';
import PropTypes from 'prop-types';

import Markdown from '../../../components/markdown';
import Link from '../../../components/link';
import CheckboxInput from '../../../components/checkbox-input';

import style from './style.module.scss';


DrugDisplayOptions.propTypes = {
  drugDisplayNames: PropTypes.objectOf(
    PropTypes.string.isRequired
  ).isRequired,
  drugDisplayOptions: PropTypes.arrayOf(
    PropTypes.shape({
      drugClass: PropTypes.string.isRequired,
      drugs: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          disabled: PropTypes.bool.isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  ),
  messages: PropTypes.objectOf(
    PropTypes.string.isRequired
  ).isRequired,
  uncheckedDrugs: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

function DrugDisplayOptions({
  drugDisplayOptions,
  drugDisplayNames,
  messages,
  uncheckedDrugs,
  onChange,
  onSelectAll,
  onReset
}) {

  return (
    <fieldset className={style['drug-display-options']}>
      <legend>
        {messages['drug-display-options-title']}
      </legend>
      <p className={style['first-para']}>
        <Markdown inline>
          {messages['drug-display-options-desc']}
        </Markdown> (
        <Link
         href="#select-all"
         onClick={onSelectAll}>
          {messages['drug-display-options-select-all']}
        </Link>,{' '}
        <Link
         href="#revert"
         onClick={onReset}>
          {messages['drug-display-options-reset']}
        </Link>)
      </p>
      <div className={style['all-options']}>
        {drugDisplayOptions.map(({drugClass, drugs}) => <div key={drugClass}>
          <div className={style['label-drug-class']}>{drugClass}:</div>
          <div className={style['checkboxes']}>
            {drugs.map(({name, disabled}) => (
              <CheckboxInput
               key={name} name="drugs"
               id={`drug-display-option-${name}`}
               className={style['drug-display-option-checkbox']}
               onChange={onChange}
               value={name}
               disabled={disabled}
               checked={!uncheckedDrugs.has(name)}>
                {drugDisplayNames[name] || name}
              </CheckboxInput>
            ))}
          </div>
        </div>)}
      </div>
    </fieldset>
  );
}

export default function useDrugDisplayOptions(config) {
  const {
    drugDisplayOptions,
    drugDisplayNames,
    messages
  } = config;
  const defaultUncheckedDrugs = React.useMemo(
    () => Object
      .values(drugDisplayOptions || {})
      .reduce((acc, {drugs}) => [
        ...acc,
        ...drugs
          .filter(({disabled}) => !disabled)
          .map(({name}) => name)
      ], []),
    [drugDisplayOptions]
  );

  const [
    uncheckedDrugs,
    setUncheckedDrugs
  ] = React.useState(new Set(defaultUncheckedDrugs));

  const handleChange = React.useCallback(
    e => {
      const drug = e.currentTarget.value;
      const newUncheckedDrugs = new Set(uncheckedDrugs);
      if (e.currentTarget.checked) {
        newUncheckedDrugs.delete(drug);
      } else {
        newUncheckedDrugs.add(drug);
      }
      setUncheckedDrugs(newUncheckedDrugs);
    },
    [uncheckedDrugs]
  );

  const handleSelectAll = React.useCallback(
    e => {
      e.preventDefault();
      setUncheckedDrugs(new Set());
    },
    []
  );

  const handleReset = React.useCallback(
    e => {
      e.preventDefault();
      setUncheckedDrugs(new Set(defaultUncheckedDrugs));
    },
    [defaultUncheckedDrugs]
  );

  const getSubmitState = React.useCallback(
    () => ({disabledDrugs: Array.from(uncheckedDrugs)}),
    [uncheckedDrugs]
  );

  return [
    drugDisplayOptions ? (
      <DrugDisplayOptions
       {...{
         drugDisplayOptions,
         drugDisplayNames,
         messages,
         uncheckedDrugs,
         onChange: handleChange,
         onSelectAll: handleSelectAll,
         onReset: handleReset
       }} />
    ) : null,
    getSubmitState
  ];

}
