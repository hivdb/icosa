import React from 'react';
import RemarkMacro from 'remark-macro';

const macro = RemarkMacro();
export default macro;

interface BadMacroNodeProps {
  data: {
    hChildren: {value: string}[];
  };
}

/**
 * Render an error message when an unrecognised macro is encountered.
 *
 * @param props - AST node data describing the invalid macro.
 * @returns A simple error message element.
 */
export function BadMacroNode({data: {hChildren}}: BadMacroNodeProps) {
  return <div><strong>Error</strong>: {hChildren[0].value}</div>;
}
