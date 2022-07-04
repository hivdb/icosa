import React from 'react';
import {Link} from 'found';


export default function Home() {

  return <div>
    <ul>
      <li>
        SARS-CoV-2 Analysis Program
        <ul>
          <li><Link to="/sars2/by-patterns/">By mutations</Link></li>
          <li><Link to="/sars2/by-sequences/">By sequence</Link></li>
          <li><Link to="/sars2/by-reads/">By NGS reads</Link></li>
          <li><Link to="/sars2/ngs2codfreq/">FASTQ-to-CodFreq</Link></li>
        </ul>
      </li>
      <li>
        HIV-1 Pol Analysis Program
        <ul>
          <li><Link to="/hiv/by-patterns/">By mutations</Link></li>
          <li><Link to="/hiv/by-sequences/">By sequence</Link></li>
          <li><Link to="/hiv/by-reads/">By NGS reads</Link></li>
          <li><Link to="/hiv/ngs2codfreq/">FASTQ-to-CodFreq</Link></li>
        </ul>
      </li>
      <li>
        HIV-1 CA Analysis Program
        <ul>
          <li><Link to="/hivca/by-sequences/">By sequence</Link></li>
          <li><Link to="/hivca/by-reads/">By NGS reads</Link></li>
          <li><Link to="/hivca/ngs2codfreq/">FASTQ-to-CodFreq</Link></li>
        </ul>
      </li>
      <li>
        HIVseq Analysis Program
        <ul>
          <li><Link to="/hivseq/by-patterns/">By mutations</Link></li>
          <li><Link to="/hivseq/by-sequences/">By sequence</Link></li>
          <li><Link to="/hivseq/by-reads/">By NGS reads</Link></li>
          <li><Link to="/hivseq/ngs2codfreq/">FASTQ-to-CodFreq</Link></li>
        </ul>
      </li>
      <li>
        HIValg Analysis Program
        <ul>
          <li><Link to="/hivalg/by-patterns/">By mutations</Link></li>
          <li><Link to="/hivalg/by-sequences/">By sequence</Link></li>
          <li><Link to="/hivalg/by-reads/">By NGS reads</Link></li>
          <li><Link to="/hivalg/ngs2codfreq/">FASTQ-to-CodFreq</Link></li>
        </ul>
      </li>
      <li>
        HIV-2 Analysis Program
        <ul>
          <li><Link to="/hiv2/by-patterns/">By mutations</Link></li>
          <li><Link to="/hiv2/by-sequences/">By sequence</Link></li>
          <li><Link to="/hiv2/ngs2codfreq/">FASTQ-to-CodFreq</Link></li>
        </ul>
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
