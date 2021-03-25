import React from 'react';
import Markdown from '../../components/markdown';
import genomeMaps from './genome-maps.json';

const webpackMarkdownLoader = require.context(
  '!raw-loader!./',
  false,
  /\.md$/,
);

const markdownFiles = webpackMarkdownLoader
  .keys()
  .map(filename => webpackMarkdownLoader(filename));

const testMd = markdownFiles[0].default;


function RefDataLoader({onLoad, setReference, references}) {
  setTimeout(() => {
    for (const ref of references) {
      setReference(
        ref.name,
        {...ref, children: ref.name + 'aaaa'},
        /*incr=*/false
      );
    }
    onLoad();
  }, 8000);
  return null;
}


export default class MarkdownDebugger extends React.Component {

  render() {
    return (
      <Markdown
       toc
       refDataLoader={RefDataLoader}
       collapsableLevels={['h3']}
       genomeMaps={genomeMaps}>
        {testMd}
      </Markdown>
    );
  }
}
