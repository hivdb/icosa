import React from 'react';
import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import ConfigContext from '../../../utils/config-context';

import AnalyzeForms, {useBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import Markdown from '../../../components/markdown';

import SeqTabularReports, {subOptions as seqSubOptions} from '../tabular-report-by-sequences';
import ReadsTabularReports, {subOptions as readsSubOptions} from '../tabular-report-by-reads';

function loadExampleCodonReads(examples: string[], config: any): string[] {
  return examples.map(url => getFullLink(url, config));
}

function loadExampleFasta(examples: {url: string; title: string}[], config: any): {url: string; title: string}[] {
  return examples.map(({url, title}) => ({
    url: getFullLink(url, config),
    title
  }));
}

interface SierraFormsProps {
  config: any;
  curAnalysis: string;
  match: any;
  router: any;
}

/**
 * Render analysis forms for HBV workflows.
 *
 * @param props - {@link SierraFormsProps} containing configuration and routing.
 * @returns Rendered forms component.
 */
function SierraForms({
  config,
  curAnalysis,
  match,
  router
}: SierraFormsProps): JSX.Element {

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
         label: 'Machine-readable data (FASTA/CSV/JSON)',
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

interface SierraFormsWithConfigProps {
  curAnalysis: string;
  match: any;
  router: any;
}

/**
 * Wrapper that injects configuration into {@link SierraForms}.
 */
export default function SierraFormsWithConfig(props: SierraFormsWithConfigProps): JSX.Element {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}

