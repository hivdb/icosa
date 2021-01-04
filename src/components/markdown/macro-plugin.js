import React from 'react';
import RemarkMacro from 'remark-macro';

const macro = RemarkMacro();

macro.addMacro('void', () => {
  return {
    type: 'VoidNode'
  };
});
    

export default macro;

export function BadMacroNode({data: {hChildren}}) {
  return <div><strong>Error</strong>: {hChildren[0].value}</div>;
}

export function VoidNode() {
  return null;
}
