import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';

import 'react-virtualized-select/styles.css';


function shouldKeyDownEventCreateNewOption({keyCode}) {
  if ([9 /*TAB*/, 13 /*ENTER*/, 188].indexOf(keyCode) > -1) {
    return false;
  }
}


function newOptionCreator({label, labelKey, valueKey}) {
  const option = {};
  if (typeof label === 'object') {
    let {prompt} = label;
    label = label.label;
    option[labelKey] = prompt;
  }
  else {
    option[labelKey] = label;
  }
  option[valueKey] = '__new';
  option.cleanLabel = label;
  option.className = 'Select-create-option-placeholder';
  return option;
}


function isValidNewOption({label}) {
  if (!label) {
    return false;
  }
  return true;
}


function isOptionUnique({option, options, labelKey}) {
  return options
    .filter(existingOption => (
      existingOption[labelKey].toLowerCase() ===
      option[labelKey].toLowerCase()
    ))
    .length === 0;
}


const optionProp = PropTypes.shape({
  value: PropTypes.string,
  label: PropTypes.string.isRequired
});
optionProp.options = PropTypes.arrayOf(optionProp.isRequired);


Select.propTypes = {
  options: PropTypes.arrayOf(optionProp.isRequired),
  allowCreate: PropTypes.bool,
  loadOptions: PropTypes.func,
  value: optionProp,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  promptTextCreator: PropTypes.func
};

export default function Select({
  options,
  allowCreate,
  loadOptions,
  value,
  name,
  label: labelName,
  onChange,
  onCreate,
  promptTextCreator,
  ...props
}) {

  const handleChange = React.useCallback(
    newValue => {
      if (!newValue) {
        return onChange(null);
      }
      const {value, cleanLabel} = newValue;
      if (allowCreate && value === '__new') {
        return onCreate({label: cleanLabel});
      }
      return onChange(newValue);
    },
    [allowCreate, onChange, onCreate]
  );

  const defaultPromptTextCreator = React.useCallback(
    newLabel => {
      if (promptTextCreator) {
        return promptTextCreator(newLabel);
      }
      return {
        label: newLabel,
        prompt: `Create ${labelName.toLowerCase()} "${newLabel}"`
      };
    },
    [labelName, promptTextCreator]
  );

  let SelectComponent = ReactSelect; // the component used in JSX
  let selectComponent = null; // the component passed to VirtualizedSelect
  if (loadOptions) {
    SelectComponent = ReactSelect.Async;
  }
  if (allowCreate) {
    SelectComponent = ReactSelect.Creatable;
  }
  if (loadOptions && allowCreate) {
    SelectComponent = ReactSelect.AsyncCreatable;
  }
  if (options && options.length > 100) {
    selectComponent = SelectComponent;
    SelectComponent = VirtualizedSelect;
  }

  return (
    <SelectComponent
     shouldKeyDownEventCreateNewOption={
         shouldKeyDownEventCreateNewOption
       }
     newOptionCreator={newOptionCreator}
     promptTextCreator={defaultPromptTextCreator}
     isValidNewOption={isValidNewOption}
     isOptionUnique={isOptionUnique}
     {...props}
     selectComponent={selectComponent}
     name={name}
     value={value}
     onChange={handleChange}
     loadOptions={loadOptions}
     options={options} />
  );

}
