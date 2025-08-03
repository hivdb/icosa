import React from 'react';

const newLineRegex = /(\r\n|\n\r|\r|\n)/g;

/**
 * Convert newline characters to `<br/>` elements.
 *
 * @param text - Text containing newline characters.
 * @returns Array of strings and `<br/>` elements.
 */
export default function nl2br(text: string): Array<string | JSX.Element> {
  return text.split(newLineRegex).map((line, idx) => {
    if (newLineRegex.test(line)) {
      return <br key={idx} />;
    }
    else {
      return line;
    }
  });
}
