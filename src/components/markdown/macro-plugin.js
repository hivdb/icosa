import React from 'react';
import PropTypes from 'prop-types';
import RemarkMacro from 'remark-macro';

const macro = RemarkMacro();

export default macro;


BadMacroNode.propTypes = {
  data: PropTypes.shape({
    hChildren: PropTypes.array.isRequired
  }).isRequired
};

export function BadMacroNode({data: {hChildren}}) {
  return <div><strong>Error</strong>: {hChildren[0].value}</div>;
}
