import type {ReactNode} from 'react';

const newLineRegex = /(\r\n|\n\r|\r|\n)/g;

/**
 * Convert newline characters in a string into React elements.
 *
 * Each newline sequence is replaced with a `<br/>` element so that the
 * resulting array can be rendered directly within JSX without additional
 * processing.
 *
 * @param text - Text containing newline characters.
 * @returns Array of strings and `<br/>` elements representing the original
 * newline boundaries.
 */
export default function nl2br(text: string): ReactNode[] {
  return text.split(newLineRegex).map((line, idx) => {
    if (newLineRegex.test(line)) {
      return <br key={idx} />;
    }
    return line;
  });
}
