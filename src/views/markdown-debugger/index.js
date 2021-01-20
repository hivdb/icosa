import React from 'react';
import Markdown from '../../components/markdown';

const webpackMarkdownLoader = require.context(
  '!raw-loader!./',
  false,
  /\.md$/,
);

const markdownFiles = webpackMarkdownLoader
  .keys()
  .map(filename => webpackMarkdownLoader(filename));

const testMd = markdownFiles[0].default;


export default class MarkdownDebugger extends React.Component {

  render() {
    return (
      <Markdown collapsableLevels={['h3']} toc>
        {testMd}
      </Markdown>
    );
  }
}
