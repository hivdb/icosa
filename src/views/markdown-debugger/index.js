import React from 'react';
import Markdown from '../../components/markdown';


export default class MarkdownDebugger extends React.Component {

  render() {
    return (
      <Markdown collapsableLevels={['h3']} toc>
        {"## AAA\n\n### Test1\n\n12345\n\nsdgsdh\n\n#### test\n\nsdhsdhsd[^test]\n\n### Test2\n\n54321"}
      </Markdown>
    );
  }
}
