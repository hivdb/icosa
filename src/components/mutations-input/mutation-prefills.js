import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


function MutationPrefills({labelMessage, options = [], value, onSelect}) {

  const handleSelect = React.useCallback(
    event => {
      for (const option of event.currentTarget.selectedOptions) {
        const {value} = option;
        onSelect(options.find(({name}) => name === value) || null);
        return;
      }
      onSelect(null);
    },
    [onSelect, options]
  );

  return (
    <div className={style['mutation-prefills']}>
      <label>{labelMessage}</label>
      <select
       multiple
       value={value ? [value.name] : []}
       onChange={handleSelect}>
        {options.map(
          ({name, className}) => (
            <option
             key={name}
             value={name}
             className={className}>
              {name}
            </option>
          )
        )}
      </select>
    </div>
  );
}


const optionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
});


MutationPrefills.propTypes = {
  labelMessage: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    optionShape.isRequired
  ),
  onSelect: PropTypes.func.isRequired,
  value: optionShape
};

export default function useMutationPrefills(onChange, config) {
  const {messages, mutationPrefills} = config;
  const options = [
    {name: '(clear)', mutations: [], className: style['clear-prefill']},
    ...(mutationPrefills || [])
  ];

  const [value, setValue] = React.useState(null);
  const onSelect = React.useCallback(
    option => {
      if (option.name === '(clear)') {
        setValue(null);
        onChange(null);
      }
      else {
        setValue(option);
        onChange(option);
      }
    },
    [setValue, onChange]
  );

  if (!mutationPrefills) {
    return null;
  }

  return (
    <MutationPrefills
     labelMessage={
       messages['pattern-analysis-prefill-label'] ||
       '<pattern-analysis-prefill-label>'
     }
     {...{value, onSelect, options}} />
  );
}
