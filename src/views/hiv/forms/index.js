import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import {getFullLink} from '../../../utils/cms';
import setTitle from '../../../utils/set-title';
import AnalyzeForms, {useBasePath} from '../../../components/analyze-forms';
import Intro, {IntroHeader} from '../../../components/intro';
import {ConfigContext} from '../../../components/report';
import Markdown from '../../../components/markdown';
import Link from '../../../components/link';
import CheckboxInput from '../../../components/checkbox-input';
/* import AlgVerSelect, {
  getLatestVersion
} from '../../components/algver-select'; */

import SeqTabularReports, {
  subOptions as seqSubOptions
} from '../tabular-report-by-sequences';
import ReadsTabularReports, {
  subOptions as readsSubOptions
} from '../tabular-report-by-reads';

import {useDrugDisplayOptions} from './hooks';

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
    // species: PropTypes.string.isRequired,
    formEnableTabs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    drugDisplayNames: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired,
    drugDisplayOptions: PropTypes.arrayOf(
      PropTypes.shape({
        drugClass: PropTypes.string.isRequired,
        drugs: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            disabled: PropTypes.bool.isRequired
          }).isRequired
        ).isRequired
      }).isRequired
    ),
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
    formEnableTabs,
    drugDisplayOptions,
    drugDisplayNames
  } = config;
  const {
    uncheckedDrugs,
    handleDrugOptionChange,
    handleSelectAllDrugs,
    handleRemoveAddonDrugs
  } = useDrugDisplayOptions(config);
  // const [algorithm, setAlgorithm] = React.useState(
  //   getLatestVersion('HIVDB', species)
  // );
  // const showAlgOpt = true;

  const handleSubmit = React.useCallback(
    () => {
      return [true, {
        disabledDrugs: Array.from(uncheckedDrugs)
      }];
    },
    [uncheckedDrugs]
  );

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
    {drugDisplayOptions ?
      <fieldset className={style['drug-display-options']}>
        <legend>
          {config.messages['drug-display-options-title']}
        </legend>
        <p className={style['first-para']}>
          <Markdown inline>
            {config.messages['drug-display-options-desc']}
          </Markdown> (
          <Link
           href="#select-all"
           onClick={handleSelectAllDrugs}>
            {config.messages['drug-display-options-select-all']}
          </Link>,{' '}
          <Link
           href="#revert"
           onClick={handleRemoveAddonDrugs}>
            {config.messages['drug-display-options-reset']}
          </Link>)
        </p>
        <div className={style['all-options']}>
          {drugDisplayOptions.map(({drugClass, drugs}) => <div key={drugClass}>
            <div className={style['label-drug-class']}>{drugClass}:</div>
            <div className={style['checkboxes']}>
              {drugs.map(({name, disabled}) => (
                <CheckboxInput
                 key={name} name="drugs"
                 id={`drug-display-option-${name}`}
                 className={style['drug-display-option-checkbox']}
                 onChange={handleDrugOptionChange}
                 value={name}
                 disabled={disabled}
                 checked={!uncheckedDrugs.has(name)}>
                  {drugDisplayNames[name] || name}
                </CheckboxInput>
              ))}
            </div>
          </div>)}
        </div>
      </fieldset> : null}
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
