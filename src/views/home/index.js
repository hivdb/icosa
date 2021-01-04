import React from 'react';
import {Link} from 'found';


export default function Home() {

  return <div>
    <ul>
      <li>
        <Link to="/sars2/by-sequences/">SARS2 Sequence Analysis</Link>
        <ul><li><Link to="/sars2/by-reads/">By reads</Link></li></ul>
      </li>
      <li>
        <Link to="/mut-annot-viewer/">Mutation Annotation Viewer</Link>
        <ul>
          <li><Link to="/mut-annot-viewer/SARS2S/">SARS2 S</Link></li>
          <li><Link to="/mut-annot-viewer/SARS2RdRP/">SARS2 RdRP</Link></li>
        </ul>
      </li>
    </ul>
  </div>;

}
