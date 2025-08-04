import React from 'react';

import setTitle from '../../../utils/set-title';
import ConfigContext from '../../../utils/config-context';

import AnalyzeForms, {useBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import Markdown from '../../../components/markdown';

import SeqTabularReports, {subOptions as seqSubOptions} from '../tabular-report-by-sequences';
import ReadsTabularReports, {subOptions as readsSubOptions} from '../tabular-report-by-reads';
import {loadExampleCodonReads, loadExampleFasta} from './helpers';




interface SierraFormsProps {
  /** Configuration object with localized messages and examples. */
  config: any;
  /** Current analysis identifier. */
  curAnalysis: string;
  /** Routing match data from `found`. */
  match: any;
  /** Router object for navigation. */
  router: any;
}

/**
 * Render the analysis submission forms for different types of inputs.
 *
 * @param config Global configuration with labels and examples.
 * @param curAnalysis Identifier of the current analysis route.
 * @param match Routing match information containing location details.
 * @param router Router instance used for navigation.
 * @returns JSX element representing the forms page.
 */
function SierraForms({
  config,
  curAnalysis,
  match,
  router
}: SierraFormsProps) {

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
       profile: 'SARS2.json'
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

/**
 * Wrapper component that injects `ConfigContext` into `SierraForms`.
 *
 * @param props Props forwarded to `SierraForms`.
 * @returns The forms component with configuration supplied.
 */
export default function SierraFormsWithConfig(props: Omit<SierraFormsProps, 'config'>) {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
