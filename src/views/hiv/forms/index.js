import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

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


function loadExampleCodonReads(examples, config) {
  return examples.map(url => getFullLink(url, config));
}

function loadExampleFasta(examples, config) {
  return examples.map(({url, title}) => ({
    url: getFullLink(url, config),
    title
  }));
}

function useTabularReportOptions({config, match, allSubOptions}) {
  const {formEnableTabularReportOptions} = config;
  return React.useMemo(
    () => {
      const options = [...(formEnableTabularReportOptions || [])];
      if (
        options.length > 0 &&
        match.location.query?.legacyXML !== undefined
      ) {
        options.push('Raw XML report');
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


SierraForms.propTypes = {
  config: PropTypes.shape({
    // species: PropTypes.string.isRequired,
    formEnableTabs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
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
    ).isRequired,
    formEnableTabularReportOptions: PropTypes.arrayOf(
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

  // const [algorithm, setAlgorithm] = React.useState(
  //   getLatestVersion('HIVDB', species)
  // );
  // const showAlgOpt = true;

  const handleSubmit = React.useCallback(
    async () => {
      return [true, {
        ...await getDrugSubmitState(),
        ...await getAlgSubmitState()
      }];
    },
    [getDrugSubmitState, getAlgSubmitState]
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
              {...props} />
           )
         }
       } : {})
     }}
    />
  </>;
}

export default function SierraFormsWithConfig(props) {
  return <ConfigContext.Consumer>
    {config => <SierraForms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
