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

import style from './style.module.scss';


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
  config: PropTypes.shape({
    messages: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired,
    sequenceExamples: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired
      }).isRequired
    ).isRequired,
    seqReadsExamples: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }).isRequired,
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
    <div className={style['analyze-form-desc']}>
      <Markdown
       escapeHtml={false}>
        {config.messages[`${curAnalysis}-form-desc`] ||
          `&lt;${curAnalysis}-form-desc&gt;`}
      </Markdown>
    </div>
    <AnalyzeForms
     basePath={basePath}
     match={match}
     router={router}
     ngsRunners={[{
       profile: 'HIV1.json'
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

export default function SierraFormsWithConfig(props) {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
