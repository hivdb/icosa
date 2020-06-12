import React from 'react';

const newLineRegex = /(\r\n|\n\r|\r|\n)/g;

export default function nl2br(text) {
  return text.split(newLineRegex).map((line, idx) => {
    if (newLineRegex.test(line)) {
      return <br key={idx} />;
    }
    else {
      return line;
    }
  });
}
