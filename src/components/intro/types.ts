/**
 * Type definitions for Intro component and its sub-components.
 * 
 * Intro provides a structured layout for introductory sections with
 * optional headers and supplements.
 */

import type React from 'react';

/**
 * Props for IntroHeader component.
 * Renders the header section of an Intro.
 */
export interface IntroHeaderProps {
  /** Content to display in the header */
  children: React.ReactNode;
}

/**
 * Props for IntroHeaderSupplement component.
 * Renders supplementary content within an IntroHeader.
 */
export interface IntroHeaderSupplementProps {
  /** Supplementary content */
  children: React.ReactNode;
}

/**
 * Props for Intro component.
 * Main container for introductory sections.
 * 
 * @param className - CSS class name for styling
 * @param children - Child elements (IntroHeader and body content)
 */
export interface IntroProps {
  /** CSS class name for the intro container */
  className?: string;
  /** Child elements including IntroHeader and body content */
  children: React.ReactNode | React.ReactNode[];
}
