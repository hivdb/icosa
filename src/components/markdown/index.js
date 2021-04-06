import React from 'react';
import PropTypes from 'prop-types';
import OrigMarkdown from 'react-markdown/with-html';

import {AutoTOC} from '../toc';
import Collapsable from '../collapsable';
import {
  ReferenceContext,
  ReferenceContextValue,
  RefLink,
  RefDefinition,
  LoadExternalRefData
} from '../references';

import MarkdownLink from './link';
import OptReferences, {StaticRefsNode} from './references';
import MdHeadingTag from './heading-tags';
import RootWrapper from './root-wrapper';
import ImageWrapper from './image-wrapper';
import macroPlugin, {BadMacroNode} from './macro-plugin';
import TableNodeWrapper from './macro-table';
import GenomeMapNodeWrapper from './macro-genome-map';
import TOCNodeWrapper from './macro-toc';
import {presetShape as genomeMapPresetShape} from '../genome-map';


/*function parsedHtml({element, escapeHtml, skipHtml, value}) {
  if (skipHtml) {
    return null;
  }
  if (escapeHtml) {
    return value;
  }
  return element;
}*/


function ExtendedMarkdown({
  noHeadingStyle,
  toc,
  children,
  referenceTitle,
  inline,
  tocClassName,
  disableHeadingTagAnchor,
  referenceHeadingTagLevel,
  collapsableLevels,
  imagePrefix,
  cmsPrefix,
  tables,
  genomeMaps,
  refDataLoader,
  displayReferences,
  renderers: addRenderers,
  ...props
}) {

  if (children instanceof Array) {
    children = children.join('');
  }
  const mdProps = {
    parserOptions: {footnotes: true},
    transformLinkUri: false,
    ...props
  };
  const generalRenderers = {
    link: MarkdownLink,
    image: ImageWrapper({imagePrefix}),
    footnote: RefLink,
    footnoteReference: RefLink,
    footnoteDefinition: RefDefinition,
    ...(noHeadingStyle ? null : {
      heading: MdHeadingTag(disableHeadingTagAnchor)
    }),
    ...addRenderers
  };
  const renderers = {
    ...generalRenderers,
    BadMacroNode,
    StaticRefsNode,
    TableNode: TableNodeWrapper({tables, mdProps, cmsPrefix}),
    GenomeMapNode: GenomeMapNodeWrapper({genomeMaps}),
    TOCNode: TOCNodeWrapper({className: tocClassName}),
    // table: SimpleTableContainer,
    // parsedHtml,
    ...(inline ? {} : {root: RootWrapper}),
    ...(inline ? {paragraph: ({children}) => <>{children}</>} : null),
    ...addRenderers
  };
  mdProps.renderers = generalRenderers;
  let jsx = (
    <OrigMarkdown
     {...mdProps}
     key={children}
     children={children}
     renderers={renderers}
     plugins={[macroPlugin.transformer]} />
  );
  if (displayReferences) {
    const context = new ReferenceContextValue(refDataLoader);
    jsx = (
      <ReferenceContext.Provider value={context}>
        {jsx}
        <LoadExternalRefData />
        <OptReferences
         disableAnchor={disableHeadingTagAnchor}
         level={referenceHeadingTagLevel}
         {...{referenceTitle}} />
      </ReferenceContext.Provider>
    );
  }
  if (collapsableLevels && collapsableLevels.length > 0) {
    jsx = <Collapsable levels={collapsableLevels}>{jsx}</Collapsable>;
  }
  if (toc) {
    return (
      <AutoTOC
       key={children}
       className={tocClassName}>
        {jsx}
      </AutoTOC>
    );
  }
  else {
    return jsx;
  }
}


ExtendedMarkdown.propTypes = {
  toc: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  ]).isRequired,
  tocClassName: PropTypes.string,
  inline: PropTypes.bool.isRequired,
  renderers: PropTypes.object.isRequired,
  collapsableLevels: PropTypes.array,
  disableHeadingTagAnchor: PropTypes.bool.isRequired,
  noHeadingStyle: PropTypes.bool.isRequired,
  referenceTitle: PropTypes.string.isRequired,
  referenceHeadingTagLevel: PropTypes.number.isRequired,
  refDataLoader: PropTypes.func,
  imagePrefix: PropTypes.string,
  cmsPrefix: PropTypes.string,
  displayReferences: PropTypes.bool.isRequired,
  genomeMaps: PropTypes.objectOf(genomeMapPresetShape.isRequired),
  tables: PropTypes.objectOf(PropTypes.shape({
    columnDefs: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired
  }).isRequired)
};

ExtendedMarkdown.defaultProps = {
  toc: false,
  inline: false,
  renderers: {},
  noHeadingStyle: false,
  referenceTitle: 'References',
  disableHeadingTagAnchor: false,
  displayReferences: true,
  referenceHeadingTagLevel: 2,
  imagePrefix: '/',
  tables: {}
};

export default React.memo(
  ExtendedMarkdown,
  ({children: prev}, {children: next}) => prev === next
);
