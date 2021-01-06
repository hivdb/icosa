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
import macroPlugin, {BadMacroNode} from './macro-plugin';
import TableNodeWrapper from './macro-table';


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

  static getDerivedStateFromProps = (props, state = {}) => {
    let {children, LoadReferences} = props;
    if (children instanceof Array) {
      children = children.join('');
    }
    if (
      children !== state.children &&
      LoadReferences !== state.LoadReferences
    ) {
      return {
        children,
        LoadReferences,
        context: new ReferenceContextValue(LoadReferences)
      };
    }
    return null;
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  render() {
    let {
      noHeadingStyle, toc,
      referenceTitle, inline, tocClassName,
      disableHeadingTagAnchor,
      referenceHeadingTagLevel,
      collapsableLevels,
      imagePrefix,
      cmsPrefix,
      tables,
      renderers: addRenderers, ...props
    } = this.props;
    const {children, context} = this.state;
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
      TableNode: TableNodeWrapper({tables, mdProps, cmsPrefix}),
      // table: SimpleTableContainer,
      // parsedHtml,
      ...(inline ? {} : {root: RootWrapper}),
      ...(inline ? {paragraph: ({children}) => <>{children}</>} : null),
      ...addRenderers
    };
    mdProps.renderers = generalRenderers;
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
