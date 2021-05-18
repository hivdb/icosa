import React from 'react';
import {Link} from 'found';


export default function Home() {

  return <div>
    <ul>
      <li>
        <Link to="/sars2/by-patterns/">SARS2 Patterns Analysis</Link>
        <ul>
          <li><Link to="/sars2/by-sequences/">By sequence</Link></li>
          <li><Link to="/sars2/by-reads/">By reads</Link></li>
        </ul>
      </li>
      <li>
        <Link to="/ngs-uploader/">NGS Uploader DevTools</Link>
      </li>
      <li>
        <Link to="/mut-annot-viewer/">Mutation Annotation Viewer</Link>
        <ul>
          <li><Link to="/mut-annot-viewer/SARS2S/">SARS2 S</Link></li>
          <li><Link to="/mut-annot-viewer/SARS2RdRP/">SARS2 RdRP</Link></li>
        </ul>
      </li>
      <li>
        <Link to="/markdown-debugger/">Markdown Debugger</Link>
      </li>
    </ul>
  </div>;

}
