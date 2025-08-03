import React from 'react';
import {HeadingTag} from '../heading-tags';

export function MdHeadingTagAnchorDisabled(props: React.ComponentProps<typeof HeadingTag>) {
  return <HeadingTag disableAnchor {...props} />;
}

export default function MdHeadingTag(disableAnchor?: boolean) {
  if (disableAnchor) {
    return MdHeadingTagAnchorDisabled;
  }
  else {
    return HeadingTag;
  }
}
