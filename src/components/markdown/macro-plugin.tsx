import React from 'react';
import RemarkMacro from 'remark-macro';

const macro = RemarkMacro();
export default macro;

interface BadMacroNodeProps {
  data: {
    hChildren: {value: string}[];
  };
}

export function BadMacroNode({data: {hChildren}}: BadMacroNodeProps) {
  return <div><strong>Error</strong>: {hChildren[0].value}</div>;
}
