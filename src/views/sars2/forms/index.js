import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import AnalyzeForms, {getBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import {ConfigContext} from '../../../components/report';
import Markdown from '../../../components/markdown';

import SeqTabularReports, {
  subOptions as seqSubOptions
} from '../tabular-report-by-sequences';
import ReadsTabularReports, {
  subOptions as readsSubOptions
} from '../tabular-report-by-reads';


function loadExampleCodonReads(examples) {
  return examples.map(getFullLink);
}

function loadExampleFasta(examples) {
  return examples.map(({url, title}) => ({
    url: getFullLink(url),
    title
  }));
}

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
  const title = (
    config.messages[`${curAnalysis}-form-title`] ||
    `<${curAnalysis}-form-title>`
  );
  const patternsTo = `${basePath}/by-patterns/report/`;
  const sequencesTo = `${basePath}/by-sequences/report/`;
  const readsTo = `${basePath}/by-reads/report/`;

  setTitle(title);

  return <>
    <Intro>
      <IntroHeader>
        <h1>{title}</h1>
      </IntroHeader>
    </Intro>
    <Markdown escapeHtml={false}>
      {config.messages[`${curAnalysis}-form-desc`] ||
        `&lt;${curAnalysis}-form-desc&gt;`}
    </Markdown>
    <AnalyzeForms
     basePath={basePath}
     match={match}
     router={router}
     ngs2codfreqSide={<Markdown escapeHtml={false}>
       {config.messages['codfreq-example'] ||
         `&lt;codfreq-example&gt;`}
     </Markdown>}
     patternsTo={patternsTo}
     sequencesTo={sequencesTo}
     enableReads readsTo={readsTo}
     exampleFasta={loadExampleFasta(config.sequenceExamples)} 
     exampleCodonReads={loadExampleCodonReads(config.seqReadsExamples)}
     sequencesOutputOptions={{
       __printable: {
         label: 'Printable HTML'
       },
       csv: {
         label: "Spreadsheets (CSV)",
         subOptions: seqSubOptions,
         defaultSubOptions: seqSubOptions.map((_, idx) => idx),
         renderer: props => (
           <SeqTabularReports
            patternsTo={patternsTo}
            sequencesTo={sequencesTo}
            readsTo={readsTo}
            {...props} />
         )
       }
     }}
     seqReadsOutputOptions={{
       __printable: {
         label: 'Printable HTML'
       },
       csv: {
         label: "Sequences and spreadsheets (FASTA/CSV)",
         children: readsSubOptions,
         defaultChildren: readsSubOptions.map((_, idx) => idx),
         renderer: props => (
           <ReadsTabularReports
            patternsTo={patternsTo}
            sequencesTo={sequencesTo}
            readsTo={readsTo}
            {...props} />
         )
       }
     }}
    />
  </>;
}

SierraForms.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  curAnalysis: PropTypes.string.isRequired,
  pathPrefix: PropTypes.string.isRequired,
};

export default function SierraFormsWithConfig(props) {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
