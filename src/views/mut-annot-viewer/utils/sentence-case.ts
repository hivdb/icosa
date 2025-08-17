import upperFirst from 'lodash/upperFirst';

/**
 * Convert a string to sentence case (capitalize the first character).
 *
 * @param text - Input text.
 * @returns The text with the first character converted to upper case.
 */
export default function sentenceCase(text: string): string {
  return upperFirst(text);
}
