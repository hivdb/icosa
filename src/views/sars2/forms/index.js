import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import AnalyzeForms, {
  getCurrentTab, getBasePath
} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';


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


export default class SierraForms extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    species: PropTypes.string.isRequired,
    pathPrefix: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  }

  static defaultProps = {
    children: <Intro>
      <IntroHeader>
        <h1>SARS2 Sequence Analysis Program</h1>
        <p>
          Genotypic Resistance Interpretation Algorithm
        </p>
      </IntroHeader>
    </Intro>
  }

  get showAlgOpt() {
    const {query} = this.props.match.location;
    return Boolean(query && 'alg-opt' in query);
  }

  render() {
    const {species, match, router, children} = this.props;
    const currentTab = getCurrentTab(match.location);
    const basePath = getBasePath(match.location);
    const isReads = currentTab === 'by-reads';
    const titleSuffix = (
      isReads ? 'Sequence Reads Analysis' : 'Sequence Analysis'
    );

    setTitle(`${species} ${titleSuffix}`);

    return <>
      {children}
      <AnalyzeForms
       basePath={basePath}
       match={match}
       router={router}
       sequencesTo={`${basePath}/by-sequences/report/`}
       enableReads readsTo={`${basePath}/by-reads/report/`}
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
