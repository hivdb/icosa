import React from 'react';
import {HeadingTag} from '../heading-tags';


export function MdHeadingTagAnchorDisabled(props) {
  return <HeadingTag disableAnchor {...props} />;
}


export default function MdHeadingTag(disableAnchor) {
  if (disableAnchor) {
    return MdHeadingTagAnchorDisabled;
  }
  else {
    return HeadingTag;
  }
}
