import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import AnalyzeForms, {getBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import {ConfigContext} from '../../../components/report';
import Markdown from '../../../components/markdown';

import SeqTabularReports, {subOptions} from '../tabular-report-by-sequences';


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


function SierraForms({
  config,
  curAnalysis,
  match,
  match: {
    location: {query = {}}
  },
  router,
  pathPrefix,
}) {

  const basePath = getBasePath(match.location);
  const title = config.messages[`${curAnalysis}-form-title`];

  setTitle(title);

  return <>
    <Intro>
      <IntroHeader>
        <h1>{title}</h1>
      </IntroHeader>
    </Intro>
    <Markdown escapeHtml={false}>
      {config.messages[`${curAnalysis}-form-desc`]}
    </Markdown>
    <AnalyzeForms
     basePath={basePath}
     match={match}
     router={router}
     patternsTo={`${basePath}/by-patterns/report/`}
     sequencesTo={`${basePath}/by-sequences/report/`}
     enableReads readsTo={`${basePath}/by-reads/report/`}
     exampleFasta={exampleFasta} 
     exampleCodonReads={exampleCodonReads}
     sequencesOutputOptions={{
       __printable: {
         label: 'Printable HTML'
       },
       tsv: {
         label: "Spreadsheets (TSV)",
         subOptions,
         defaultSubOptions: subOptions.map((_, idx) => idx),
         renderer: props => (
           <SeqTabularReports {...props} />
         )
       }
     }}
    />
  </>;
}

SierraForms.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  species: PropTypes.string.isRequired,
  pathPrefix: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default function SierraFormsWithConfig(props) {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
