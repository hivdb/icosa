import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import AnalyzeForms, {getCurrentTab} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import Link from '../../../components/link';


const exampleCodonReads = [
  getFullLink('downloads/codfreq-examples/ERR4085387.S.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/ERR4181732.S.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/ERR4181742.S.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/ERR4181776.S.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/SRR11494719.RdRP.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/SRR11494735.RdRP.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/SRR11577999.RdRP.codfreq.txt'),
  getFullLink('downloads/codfreq-examples/SRR11578120.RdRP.codfreq.txt'),
];

const exampleFasta = [
  {
    url: getFullLink('downloads/fasta-example.fas'),
    title: 'FASTA example (N=2)'
  }
];

export default class HivdbForms extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    species: PropTypes.string.isRequired
  }

  get showAlgOpt() {
    const {query} = this.props.match.location;
    return Boolean(query && 'alg-opt' in query);
  }

  get currentTab() {
    return getCurrentTab(this.props.match.location);
  }

  render() {
    const {species, match, router} = this.props;
    const isReads = this.currentTab === 'by-reads';
    const titleSuffix = (
      isReads ? 'Sequence Reads Analysis' : 'Sequence Analysis'
    );

    setTitle(`${species} Sequence Analysis Program: ${titleSuffix}`);

    return <>
      <Intro>
        <IntroHeader>
          <h1>SARS2 Sequence Analysis Program</h1>
          <p>{isReads ?
            <Link to="/page/hivdb-ngs-release-notes/">
              Release Notes
            </Link> :
            'Genotypic Resistance Interpretation Algorithm'
          }</p>
        </IntroHeader>
      </Intro>
      <AnalyzeForms
       basePath="/sars2"
       match={match}
       router={router}
       sequencesTo="/sars2/by-sequences/report/"
       enableReads readsTo="/sars2/by-reads/report/"
       exampleFasta={exampleFasta} 
       exampleCodonReads={exampleCodonReads}
       sequencesOutputOptions={{
         __printable: {
           label: 'Printable HTML'
         }
       }}
      />
    </>;
  }

}
