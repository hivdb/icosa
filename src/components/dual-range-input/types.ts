/**
 * Props for the NumberDualRangeInput component.
 */
export interface NumberDualRangeInputProps {
  /**
   * Additional CSS class names.
   */
  className?: string;
  /**
   * Name attribute for the start input.
   */
  nameStart: string;
  /**
   * Name attribute for the end input.
   */
  nameEnd: string;
  /**
   * Current start value.
   */
  start: number;
  /**
   * Current end value.
   */
  end: number;
  /**
   * Change event handler called with (name, value).
   */
  onChange: (name: string, value: number) => void;
  /**
   * Minimum allowed value.
   */
  min?: number;
  /**
   * Maximum allowed value.
   */
  max?: number;
  /**
   * Step increment for the range inputs.
   */
  step?: number;
  /**
   * Minimum gap between start and end values.
   */
  minGap?: number;
  /**
   * Whether the inputs are disabled.
   */
  disabled?: boolean;
}
