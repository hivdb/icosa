import React from 'react';
import {HeadingTag} from '../heading-tags';

export function MdHeadingTagAnchorDisabled(props: React.ComponentProps<typeof HeadingTag>) {
  return <HeadingTag disableAnchor {...props} />;
}

export function MdHeadingTag(disableAnchor?: boolean) {
  if (disableAnchor) {
    return MdHeadingTagAnchorDisabled;
  }
  else {
    return HeadingTag;
  }
}

export default function MdHeadingTagFactory(level: 1 | 2 | 3 | 4 | 5 | 6, disableAnchor?: boolean) {
  const Component = MdHeadingTag(disableAnchor);
  return (props: Omit<React.ComponentProps<typeof HeadingTag>, 'level'>) => <Component level={level} {...props} />;
}
