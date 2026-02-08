import type React from 'react';

/**
 * Available button style variants.
 */
export type ButtonStyle = 'default' | 'info' | 'primary' | 'light' | 'link';

/**
 * Available button size variants.
 */
export type ButtonSize = 'xlarge' | 'large' | 'normal' | 'small';

/**
 * Props for the Button component.
 */
export interface ButtonProps {
  /**
   * Click event handler.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Button name attribute.
   */
  name?: string;
  /**
   * Visual style variant of the button.
   */
  btnStyle?: ButtonStyle;
  /**
   * Size variant of the button.
   */
  btnSize?: ButtonSize;
  /**
   * Custom height class number (1-10).
   */
  btnHeight?: number;
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * Additional CSS class names.
   */
  className?: string;
  /**
   * Button value attribute.
   */
  value?: string | number;
  /**
   * External link URL (renders as ExtLink).
   */
  href?: string;
  /**
   * Internal route path (renders as Link).
   */
  to?: string;
  /**
   * Button type attribute.
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Button content.
   */
  children: React.ReactNode;
}
