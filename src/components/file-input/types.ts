import type React from 'react';
import type {ButtonSize, ButtonStyle} from '../button/types';

/**
 * Props for the FileInput component.
 */
export interface FileInputProps {
  /**
   * Name attribute for the file input.
   */
  name?: string;
  /**
   * Additional CSS class names.
   */
  className?: string;
  /**
   * Accepted file types (e.g., "image/*,.pdf").
   */
  accept?: string;
  /**
   * Placeholder text for the filename display.
   */
  placeholder?: string;
  /**
   * Whether the input is disabled.
   */
  disabled?: boolean;
  /**
   * Whether multiple files can be selected.
   */
  multiple?: boolean;
  /**
   * Button label content.
   */
  children?: React.ReactNode;
  /**
   * Whether to hide the selected filename display.
   */
  hideSelected?: boolean;
  /**
   * Size variant for the button.
   */
  btnSize?: ButtonSize;
  /**
   * Change event handler called with selected files.
   */
  onChange?: (files: File[]) => void;
  /**
   * Style variant for the button.
   */
  btnStyle?: ButtonStyle;
}
