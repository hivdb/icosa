import React from 'react';
import PropTypes from 'prop-types';
import OrigMarkdown from 'react-markdown/with-html';

import {AutoTOC} from '../toc';
import Collapsable from '../collapsable';
import {
  ReferenceContext, ReferenceContextValue,
  RefLink, RefDefinition
} from '../references';

import MarkdownLink from './link';
import OptReferences from './references';
import MdHeadingTag from './heading-tags';
import RootWrapper from './root-wrapper';
import ImageWrapper from './image-wrapper';
import macroPlugin, {BadMacroNode, VoidNode} from './macro-plugin';


/*function parsedHtml({element, escapeHtml, skipHtml, value}) {
  if (skipHtml) {
    return null;
  }
  if (escapeHtml) {
    return value;
  }
  return element;
}*/


export default class Markdown extends React.Component {

  static propTypes = {
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
    LoadReferences: PropTypes.func,
    imagePrefix: PropTypes.string,
    cmsPrefix: PropTypes.string,
    tables: PropTypes.objectOf(PropTypes.shape({
      columnDefs: PropTypes.array.isRequired,
      data: PropTypes.array.isRequired
    }).isRequired)
  }

  static defaultProps = {
    toc: false,
    inline: false,
    renderers: {},
    noHeadingStyle: false,
    referenceTitle: 'References',
    disableHeadingTagAnchor: false,
    referenceHeadingTagLevel: 2,
    imagePrefix: '/',
    tables: {}
  }

  render() {
    let {
      noHeadingStyle, toc,
      children,
      referenceTitle, inline, tocClassName,
      disableHeadingTagAnchor,
      referenceHeadingTagLevel,
      collapsableLevels,
      imagePrefix,
      cmsPrefix,
      tables,
      LoadReferences,
      renderers: addRenderers, ...props
    } = this.props;
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
      VoidNode,
      // table: SimpleTableContainer,
      // parsedHtml,
      ...(inline ? {} : {root: RootWrapper}),
      ...(inline ? {paragraph: ({children}) => <>{children}</>} : null),
      ...addRenderers
    };
    mdProps.renderers = generalRenderers;
    const context = new ReferenceContextValue(LoadReferences);
    let jsx = (
      <ReferenceContext.Provider value={context}>
        <OrigMarkdown
         {...mdProps}
         key={children}
         children={children}
         renderers={renderers}
         plugins={[macroPlugin.transformer]} />
        <OptReferences
         disableAnchor={disableHeadingTagAnchor}
         level={referenceHeadingTagLevel}
         {...{referenceTitle}} />
      </ReferenceContext.Provider>
    );
    if (collapsableLevels && collapsableLevels.length > 0) {
      jsx = <Collapsable levels={collapsableLevels}>{jsx}</Collapsable>;
    }
    if (toc) {
      return <AutoTOC className={tocClassName}>{jsx}</AutoTOC>;
    }
    else {
      return jsx;
    }
  }

}
