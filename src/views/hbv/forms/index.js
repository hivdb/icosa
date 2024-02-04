import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import ConfigContext from '../../../utils/config-context';

import AnalyzeForms, {useBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import Markdown from '../../../components/markdown';

import SeqTabularReports, {
  subOptions as seqSubOptions
} from '../tabular-report-by-sequences';
import ReadsTabularReports, {
  subOptions as readsSubOptions
} from '../tabular-report-by-reads';


function loadExampleCodonReads(examples, config) {
  return examples.map(url => getFullLink(url, config));
}

function loadExampleFasta(examples, config) {
  return examples.map(({url, title}) => ({
    url: getFullLink(url, config),
    title
  }));
}


SierraForms.propTypes = {
  config: PropTypes.object,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  curAnalysis: PropTypes.string.isRequired
};

function SierraForms({
  config,
  curAnalysis,
  match,
  router
}) {

  const basePath = useBasePath(match.location);
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
     ngsRunners={[{
       profile: 'HBV.json'
     }]}
     ngs2codfreqSide={<Markdown escapeHtml={false}>
       {config.messages['codfreq-example'] ||
         `&lt;codfreq-example&gt;`}
     </Markdown>}
     patternsTo={patternsTo}
     sequencesTo={sequencesTo}
     enableReads readsTo={readsTo}
     exampleFasta={loadExampleFasta(config.sequenceExamples, config)}
     exampleCodonReads={loadExampleCodonReads(config.seqReadsExamples, config)}
     sequencesOutputOptions={{
       __printable: {
         label: 'Printable HTML'
       },
       csv: {
         label: 'Machine-readable data (CSV/JSON)',
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
         label: "Machine-readable data (FASTA/CSV/JSON)",
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

export default function SierraFormsWithConfig(props) {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
