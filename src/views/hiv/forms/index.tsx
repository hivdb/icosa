import { useCallback, useMemo } from 'react';
import {Router, Match} from 'found';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import AnalyzeForms, {useBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import {ConfigContext} from '../../../components/report';
import Markdown from '../../../components/markdown';
/* import AlgVerSelect, {
  getLatestVersion
} from '../../components/algver-select'; */

import SeqTabularReports, {
  subOptions as seqAllSubOptions
} from '../tabular-report-by-sequences';
import ReadsTabularReports, {
  subOptions as readsAllSubOptions
} from '../tabular-report-by-reads';

import useDrugDisplayOptions from './drug-display-options';
import useAlgorithmSelector from './algorithm-selector';

import style from './style.module.scss';

/**
 * Convert relative example codon read URLs into absolute URLs.
 *
 * @param examples - List of example URLs.
 * @param config - CMS configuration for link resolution.
 * @returns Array of absolute URLs.
 */
function loadExampleCodonReads(examples: string[], config: any) {
  return examples.map(url => getFullLink(url, config));
}

/**
 * Convert relative example FASTA URLs into objects containing absolute URLs
 * and human readable titles.
 */
function loadExampleFasta(examples: Array<{url: string; title: string}>, config: any) {
  return examples.map(({url, title}) => ({
    url: getFullLink(url, config),
    title
  }));
}

/**
 * Determine available tabular report options based on configuration and
 * query parameters.
 */
function useTabularReportOptions({config, match, allSubOptions}: any) {
  const {formEnableTabularReportOptions} = config;
  return useMemo(
    () => {
      const options = [...(formEnableTabularReportOptions || [])];
      if (
        options.length > 0 &&
        match.location.query?.legacyXML !== undefined
      ) {
        options.push('Raw XML report (deprecated)');
      }
      return options.filter(
        opt => allSubOptions.includes(opt)
      );
    },
    [
      match.location.query?.legacyXML,
      formEnableTabularReportOptions,
      allSubOptions
    ]
  );
}


interface SierraFormsProps {
  config: any;
  curAnalysis: string;
  match: Match;
  router: Router;
}

/**
 * Main form component for the HIV views.
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

  const {
    // species,
    formEnableTabs
  } = config;

  const [
    drugDisplayOptionsNode,
    getDrugSubmitState
  ] = useDrugDisplayOptions(config);

  const [
    algorithmSelectorNode,
    getAlgSubmitState
  ] = useAlgorithmSelector(config);

  const getSubmitState = useCallback(
    async () => ({
      ...await getDrugSubmitState(),
      ...await getAlgSubmitState()
    }),
    [getDrugSubmitState, getAlgSubmitState]
  );

  // const [algorithm, setAlgorithm] = React.useState(
  //   getLatestVersion('HIVDB', species)
  // );
  // const showAlgOpt = true;

  const handleSubmit = useCallback(
    async () => {
      return [true, await getSubmitState()];
    },
    [getSubmitState]
  );

  setTitle(title);

  const seqSubOptions = useTabularReportOptions({
    config,
    match,
    allSubOptions: seqAllSubOptions
  });

  const readsSubOptions = useTabularReportOptions({
    config,
    match,
    allSubOptions: readsAllSubOptions
  });

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
    {drugDisplayOptionsNode}
    {algorithmSelectorNode}
    {/*showAlgOpt ?
      <fieldset className={style['algorithm-options']}>
        <legend>
          {config.messages['alg-options-title']}
        </legend>
        <p className={style['first-para']}>
          <Markdown inline>
            {config.messages['alg-options-desc']}
          </Markdown>
        </p>
        <AlgVerSelect
         name="algver-select"
         value={algorithm}
         species={species}
         onChange={setAlgorithm} />
      </fieldset> : null*/}
    <AnalyzeForms
     basePath={basePath}
     enableTabs={formEnableTabs}
     onSubmit={handleSubmit}
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
       ...(seqSubOptions.length > 0 ? {
         csv: {
           label: "Machine-readable data (CSV/JSON)",
           subOptions: seqSubOptions,
           defaultSubOptions: seqSubOptions.map((_, idx) => idx),
           renderer: props => (
             <SeqTabularReports
              patternsTo={patternsTo}
              sequencesTo={sequencesTo}
              readsTo={readsTo}
              getSubmitState={getSubmitState}
              {...props} />
           )
         }
       } : {})
     }}
     seqReadsOutputOptions={{
       __printable: {
         label: 'Printable HTML'
       },
       ...(readsSubOptions.length > 0 ? {
         csv: {
           label: "Machine-readable data (FASTA/CSV/JSON)",
           children: readsSubOptions,
           defaultChildren: readsSubOptions.map((_, idx) => idx),
           renderer: props => (
             <ReadsTabularReports
              patternsTo={patternsTo}
              sequencesTo={sequencesTo}
              readsTo={readsTo}
              getSubmitState={getSubmitState}
              {...props} />
           )
         }
       } : {})
     }}
    />
  </>;
}

/**
 * Wrapper component injecting configuration from context.
 */
export default function SierraFormsWithConfig(props: any) {
  return (
    <ConfigContext.Consumer>
      {config => <SierraForms {...props} config={config} />}
    </ConfigContext.Consumer>
  );
}
