import React from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';
import VirtualizedSelect from 'react-virtualized-select';

import type {SelectProps, SelectOption, NewOptionCreatorArgs, IsOptionUniqueArgs} from './types';

// Re-export types for external use
export type {SelectOption, SelectProps} from './types';

/**
 * Creates the label for a new option in react-select v5.
 *
 * @param inputValue - The input string from the user
 * @param labelName - The label name for the select (e.g., "mutation")
 * @returns The formatted label string
 */
function formatCreateLabel(inputValue: string, labelName?: string): string {
  return `Create ${labelName?.toLowerCase() || 'option'} "${inputValue}"`;
}

/**
 * Creates the data for a new option in react-select v5.
 *
 * @param inputValue - The input string from the user
 * @returns A new SelectOption object
 */
function getNewOptionData(inputValue: string): SelectOption {
  return {
    label: inputValue,
    value: inputValue,
    className: 'Select-create-option-placeholder'
  };
}

/**
 * Validates if a new option should be created in react-select v5.
 *
 * @param inputValue - The input string from the user
 * @returns true if the input is valid for creating a new option
 */
function isValidNewOption(inputValue: string): boolean {
  return inputValue.trim().length > 0;
}

/**
 * A flexible select component that supports async loading, creation of new options,
 * and virtualization for large option lists.
 *
 * @param props - Component props
 * @returns A configured ReactSelect or VirtualizedSelect component
 */
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
    (newValue: SelectOption | null) => {
      onChange(newValue);
    },
    [onChange]
  );

  const handleCreateOption = React.useCallback(
    (inputValue: string) => {
      if (onCreate) {
        onCreate({label: inputValue});
      }
    },
    [onCreate]
  );

  const formatCreateLabelCallback = React.useCallback(
    (inputValue: string) => {
      if (promptTextCreator) {
        const result = promptTextCreator(inputValue);
        if (typeof result === 'string') {
          return result;
        }
        return result.prompt || result.label;
      }
      return formatCreateLabel(inputValue, labelName);
    },
    [labelName, promptTextCreator]
  );

  // Common props for all select variants
  const commonProps = {
    ...props,
    name,
    value,
    onChange: handleChange,
    options
  };

  // Props specific to creatable variants (react-select v5 API)
  const creatableProps = allowCreate ? {
    formatCreateLabel: formatCreateLabelCallback,
    getNewOptionData,
    isValidNewOption,
    onCreateOption: handleCreateOption
  } : {};

  // Props specific to async variants
  const asyncProps = loadOptions ? {
    loadOptions
  } : {};

  // Determine which react-select variant to use based on props
  // Use early returns to avoid type assertions
  
  if (loadOptions && allowCreate) {
    if (options && options.length > 100) {
      return (
        <VirtualizedSelect
          {...commonProps}
          {...asyncProps}
          {...creatableProps}
          selectComponent={AsyncCreatableSelect}
        />
      );
    }
    return <AsyncCreatableSelect {...commonProps} {...asyncProps} {...creatableProps} />;
  }

  if (loadOptions) {
    if (options && options.length > 100) {
      return (
        <VirtualizedSelect
          {...commonProps}
          {...asyncProps}
          selectComponent={AsyncSelect}
        />
      );
    }
    return <AsyncSelect {...commonProps} {...asyncProps} />;
  }

  if (allowCreate) {
    if (options && options.length > 100) {
      return (
        <VirtualizedSelect
          {...commonProps}
          {...creatableProps}
          selectComponent={CreatableSelect}
        />
      );
    }
    return <CreatableSelect {...commonProps} {...creatableProps} />;
  }

  if (options && options.length > 100) {
    return (
      <VirtualizedSelect
        {...commonProps}
        selectComponent={ReactSelect}
      />
    );
  }

  return <ReactSelect {...commonProps} />;
}
