import React from 'react';

/**
 * Convert newline characters in a string to `<br />` React elements.
 *
 * @param text - String potentially containing `\n`, `\r` or `\r\n` line breaks.
 * @returns Array of strings and `<br />` elements preserving line structure.
 */
export default function nl2br(text: string): Array<string | JSX.Element> {
  const newLineRegex = /(\r\n|\n\r|\r|\n)/g;
  return text.split(newLineRegex).map((line, idx) => {
    if (newLineRegex.test(line)) {
      return <br key={idx} />;
    }
    return line;
  });
}

