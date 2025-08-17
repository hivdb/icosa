import React from 'react';
import ReactSelect from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';

function shouldKeyDownEventCreateNewOption({keyCode}: {keyCode: number}) {
  if ([9, 13, 188].indexOf(keyCode) > -1) {
    return false;
  }
}

function newOptionCreator({label, labelKey, valueKey}: any) {
  const option: any = {};
  if (typeof label === 'object') {
    let {prompt} = label as any;
    label = (label as any).label;
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

function isValidNewOption({label}: any) {
  if (!label) {
    return false;
  }
  return true;
}

function isOptionUnique({option, options, labelKey}: any) {
  return options
    .filter((existingOption: any) => (
      existingOption[labelKey].toLowerCase() ===
      option[labelKey].toLowerCase()
    ))
    .length === 0;
}

export interface SelectOption {
  value?: string;
  label: string;
  cleanLabel?: string;
  className?: string;
  options?: SelectOption[];
}

export interface SelectProps {
  options?: SelectOption[];
  allowCreate?: boolean;
  loadOptions?: any;
  value?: SelectOption | null;
  name: string;
  label?: string;
  onChange: (value: SelectOption | null) => void;
  onCreate?: (value: {label: string}) => void;
  promptTextCreator?: (label: string) => any;
  [key: string]: any;
}

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
}: SelectProps) {
  const handleChange = React.useCallback(
    (newValue: any) => {
      if (!newValue) {
        return onChange(null);
      }
      const {value, cleanLabel} = newValue;
      if (allowCreate && value === '__new') {
        return onCreate && onCreate({label: cleanLabel});
      }
      return onChange(newValue);
    },
    [allowCreate, onChange, onCreate]
  );

  const defaultPromptTextCreator = React.useCallback(
    (newLabel: string) => {
      if (promptTextCreator) {
        return promptTextCreator(newLabel);
      }
      return {
        label: newLabel,
        prompt: `Create ${labelName?.toLowerCase()} "${newLabel}"`
      };
    },
    [labelName, promptTextCreator]
  );

  let SelectComponent: any = ReactSelect; // component used in JSX
  let selectComponent: any = null; // passed to VirtualizedSelect
  if (loadOptions) {
    SelectComponent = (ReactSelect as any).Async;
  }
  if (allowCreate) {
    SelectComponent = (ReactSelect as any).Creatable;
  }
  if (loadOptions && allowCreate) {
    SelectComponent = (ReactSelect as any).AsyncCreatable;
  }
  if (options && options.length > 100) {
    selectComponent = SelectComponent;
    SelectComponent = VirtualizedSelect as any;
  }

  return (
    <SelectComponent
      shouldKeyDownEventCreateNewOption={shouldKeyDownEventCreateNewOption}
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
      options={options}
    />
  );
}
