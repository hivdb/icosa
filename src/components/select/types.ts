/**
 * Type definitions for the Select component.
 */

/**
 * Represents a single option in a select dropdown.
 */
export interface SelectOption {
  /** The value of the option */
  value?: string;
  /** The display label for the option */
  label: string;
  /** Clean label without prompt text (used for created options) */
  cleanLabel?: string;
  /** CSS class name for styling */
  className?: string;
  /** Nested options for grouped selects */
  options?: SelectOption[];
}

/**
 * Props for the Select component.
 */
export interface SelectProps {
  /** Available options for the select */
  options?: SelectOption[];
  /** Allow users to create new options */
  allowCreate?: boolean;
  /** Function to load options asynchronously */
  loadOptions?: (input: string, callback: (options: SelectOption[]) => void) => void;
  /** Currently selected value */
  value?: SelectOption | null;
  /** Name attribute for the select input */
  name: string;
  /** Label text for the select (used in prompt text) */
  label?: string;
  /** Callback when selection changes */
  onChange: (value: SelectOption | null) => void;
  /** Callback when a new option is created */
  onCreate?: (value: {label: string}) => void;
  /** Custom function to create prompt text for new options */
  promptTextCreator?: (label: string) => {label: string; prompt: string} | string;
  /** Additional props passed to underlying react-select */
  [key: string]: unknown;
}

/**
 * Arguments for the newOptionCreator function.
 */
export interface NewOptionCreatorArgs {
  label: string | {label: string; prompt: string};
  labelKey: string;
  valueKey: string;
}

/**
 * Arguments for the isOptionUnique function.
 */
export interface IsOptionUniqueArgs {
  option: SelectOption;
  options: SelectOption[];
  labelKey: string;
}
