import React from 'react';

import Collapsable from '../collapsable';
import {HeadingTag} from '../heading-tags';

import {MdHeadingTagAnchorDisabled} from './heading-tags';


function getHeadingLevel(node) {
  if (
    node.type === MdHeadingTagAnchorDisabled ||
    node.type === HeadingTag
  ) {
    return node.props.level;
  }
  else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.type)) {
    return parseInt(node.type.slice(1, 2));
  }
  else {
    return -1;
  }
}


function groupSections(nodes, startIdx = 0, minLevel = 1) {
  const sections = [];
  let curSectionLevel = 0;
  let curSectionParas = [];
  for (let idx = startIdx; idx < nodes.length; idx ++) {
    const node = nodes[idx];
    const level = getHeadingLevel(node);
    if (level < 0) {
      // not a heading tag
      curSectionParas.push(node);
    }
    else if (level >= minLevel) {
      if (curSectionLevel === 0 || level <= curSectionLevel) {
        // new section
        pushSection(curSectionParas, curSectionLevel);
        curSectionLevel = level;
        curSectionParas = [node];
      }
      else {
        // new subsection
        const [subsections, endIdx] = groupSections(nodes, idx, level);
        idx = endIdx;
        curSectionParas = [
          ...curSectionParas,
          ...subsections
        ];
      }
    }
    else { // level > 0 and level < minLevel
      pushSection(curSectionParas, curSectionLevel);
      return [sections, idx - 1];
    }
  }
  pushSection(curSectionParas, curSectionLevel);
  return [sections, nodes.length];

  function pushSection(sectionParas, level) {
    if (sectionParas.length > 0) {
      sections.push(
        <Collapsable.Section
         key={`section-${startIdx}-${sections.length}-${level}`}
         level={level}>
          {({onLoad}) => {
            onLoad();
            return sectionParas;
          }}
        </Collapsable.Section>
      );
    }
  }
}


export default function renderRoot({children}) {
  children = groupSections(children)[0];
  return <>{children}</>;
}
