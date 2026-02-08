import type React from 'react';

/**
 * Props for the CheckboxInput component.
 */
export interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Unique identifier for the checkbox input.
   */
  id: string;
  /**
   * Name attribute for the checkbox input.
   */
  name: string;
  /**
   * Additional CSS class names.
   */
  className?: string;
  /**
   * Value of the checkbox when checked.
   */
  value: string | number | readonly string[];
  /**
   * Label content for the checkbox.
   */
  children: React.ReactNode;
  /**
   * Change event handler.
   */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /**
   * Whether the checkbox is checked.
   */
  checked?: boolean;
  /**
   * Whether the checkbox is disabled.
   */
  disabled?: boolean;
  /**
   * Inline styles for the label element.
   */
  style?: React.CSSProperties;
}
