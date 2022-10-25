import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pluralize from 'pluralize';

import ConfigContext from '../../../utils/config-context';
import useMessages from '../../../utils/use-messages';
import ExtLink from '../../link/external';
import Markdown from '../../markdown';
import {
  fastpConfigShape,
  defaultFastpConfig,
  cutadaptConfigShape,
  defaultCutadaptConfig,
  ivarConfigShape,
  defaultIvarConfig
} from './prop-types';

import style from './style.module.scss';
import FlagSwitch from './flag-switch';
import NumberRangeInput from './number-range-input';
import AdapterInput from './adapter-input';
import PrimerSequenceInput from './primer-sequence-input';
import PrimerLocationInput from './primer-location-input';
import CheckboxInput from '../../checkbox-input';
import Button from '../../button';
import FileInput from '../../file-input';
import readFile from '../../../utils/read-file';
import {makeDownload} from '../../../utils/download';
import useMounted from '../../../utils/use-mounted';

const ADAPTER_TRIMMING_VALUES = [false, true];
const ADAPTER_TRIMMING_TEXTS = ['Yes', 'No'];

const QUALITY_FILTERING_VALUES = [false, true];
const QUALITY_FILTERING_TEXTS = ['Yes', 'No'];

const LENGTH_FILTERING_VALUES = [false, true];
const LENGTH_FILTERING_TEXTS = ['Yes', 'No'];

const PRIMER_TYPE_VALUES = ['fasta', 'bed', 'off'];
const PRIMER_TYPE_TEXTS = ['Sequence (FASTA)', 'Location (BED)', 'Off'];

const NO_INDELS_VALUES = [false, true];
const NO_INDELS_TEXTS = ['Allow', 'Disallow'];

const POLY_G_TRIMMING_VALUES = [false, true];
const POLY_G_TRIMMING_TEXTS = ['Yes', 'No'];

const INCLUDE_UNMERGED_VALUES = [true, false];
const INCLUDE_UNMERGED_TEXTS = ['Include', 'Exclude'];


NGSOptionsForm.propTypes = {
  isDefault: PropTypes.bool.isRequired,
  fastpConfig: fastpConfigShape.isRequired,
  cutadaptConfig: cutadaptConfigShape.isRequired,
  ivarConfig: ivarConfigShape.isRequired,
  primerType: PropTypes.oneOf(['fasta', 'bed', 'off']).isRequired,
  saveInBrowser: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

NGSOptionsForm.defaultProps = {
  fastpConfig: {...defaultFastpConfig},
  cutadaptConfig: {...defaultCutadaptConfig},
  ivarConfig: {...defaultIvarConfig},
  saveInBrowser: true,
  primerType: 'off'
};


export default function NGSOptionsForm({
  isDefault,
  fastpConfig,
  cutadaptConfig,
  ivarConfig,
  fastpConfig: {
    includeUnmerged,
    qualifiedQualityPhred,
    unqualifiedPercentLimit,
    nBaseLimit,
    averageQual,
    lengthRequired,
    lengthLimit,
    adapterSequence,
    adapterSequenceR2,
    disableAdapterTrimming,
    disableTrimPolyG,
    disableQualityFiltering,
    disableLengthFiltering
  },
  cutadaptConfig: {
    primerSeqs,
    errorRate,
    noIndels,
    times,
    minOverlap
  },
  ivarConfig: {
    primerBeds
  },
  primerType,
  saveInBrowser,
  onChange
}) {
  const isMounted = useMounted();
  const [config] = ConfigContext.use();
  const [fastaDesc, bedDesc] = useMessages([
    'ngs2codfreq-primer-fasta-input-desc',
    'ngs2codfreq-primer-bed-input-desc'
  ], config?.messages);

  const handleSaveInBrowserChange = React.useCallback(
    event => onChange('saveInBrowser', event.currentTarget.checked),
    [onChange]
  );

  const handleDownload = React.useCallback(
    () => {
      const payload = JSON.stringify({
        fastpConfig,
        cutadaptConfig,
        ivarConfig,
        primerType
      });
      makeDownload(
        'ngs2codfreq.cdfjson',
        'application/json',
        payload
      );
    },
    [fastpConfig, cutadaptConfig, ivarConfig, primerType]
  );

  const handleUpload = React.useCallback(
    async ([file]) => {
      const rawJSON = await readFile(file);
      const payload = JSON.parse(rawJSON);
      if (isMounted()) {
        onChange('.', payload);
      }
    },
    [isMounted, onChange]
  );

  const handleReset = React.useCallback(
    () => {
      if (window.confirm(
        "You are about to reset all settings. " +
        "This operation is irreversible if you don't have a local backup. " +
        "Please confirm to proceed."
      )) {
        onChange('.', {
          fastpConfig: {...defaultFastpConfig},
          cutadaptConfig: {...defaultCutadaptConfig},
          ivarConfig: {...defaultIvarConfig},
          primerType: 'off'
        });
      }
    },
    [onChange]
  );

  return <form className={style['ngs-options-form']}>
    <fieldset>
      <div className={style['fieldrow']}>
        <div className={classNames(style['pull-right'], style['fieldinput'])}>
          <CheckboxInput
           id="saveInBrowser"
           name="saveInBrowser"
           checked={saveInBrowser}
           value=""
           onChange={handleSaveInBrowserChange}>
            Save below settings in my browser for future use
          </CheckboxInput>
        </div>
        <div className={classNames(style['pull-right'], style['fielddesc'])}>
          {isDefault ? <>
            Current settings are the default settings.
          </> : <>
            Current settings are <strong>not</strong> the default settings.
            Use "reset all" to restore to default.
          </>}
        </div>
      </div>
      <div className={style['fieldrow']}>
        <div className={classNames(style['pull-right'], style['fieldinput'])}>
          <FileInput
           hideSelected
           btnStyle="info"
           accept=".cdfjson"
           onChange={handleUpload}>
            Open settings
          </FileInput>
          <span className={style['or']}>or</span>
          <Button
           btnStyle="primary"
           onClick={handleDownload}>
            Save settings
          </Button>
          {'\xa0\xa0\xa0'}
          <Button
           btnStyle="light"
           onClick={handleReset}>
            Reset all
          </Button>
        </div>
      </div>
    </fieldset>
    <fieldset>
      <FlagSwitch
       name="fastpConfig.disableAdapterTrimming"
       label="Adapter trimming"
       value={disableAdapterTrimming}
       valueChoices={ADAPTER_TRIMMING_VALUES}
       textChoices={ADAPTER_TRIMMING_TEXTS}
       onChange={onChange} />
      <AdapterInput
       disabled={disableAdapterTrimming}
       name="fastpConfig.adapterSequence"
       label="Adapter sequence"
       value={adapterSequence}
       onChange={onChange}>
        The adapter for read1. For single-end data, if not specified, the
        adapter will be auto-detected. For paired-end data, this is used if
        R1/R2 are found not overlapped.
      </AdapterInput>
      <AdapterInput
       disabled={disableAdapterTrimming}
       name="fastpConfig.adapterSequenceR2"
       label="Adapter sequence R2"
       value={adapterSequenceR2}
       onChange={onChange}>
        The adapter for read2 (paired-end data only). This is used if R1/R2 are
        found not overlapped. If not specified, it will be the same as "adapter
        sequence".
      </AdapterInput>
    </fieldset>
    <fieldset>
      <FlagSwitch
       name="fastpConfig.disableQualityFiltering"
       label="Quality filtering"
       value={disableQualityFiltering}
       valueChoices={QUALITY_FILTERING_VALUES}
       textChoices={QUALITY_FILTERING_TEXTS}
       onChange={onChange} />
      <NumberRangeInput
       disabled={disableQualityFiltering}
       name="fastpConfig.qualifiedQualityPhred"
       label="Min phred score"
       value={qualifiedQualityPhred}
       defaultValue={defaultFastpConfig.qualifiedQualityPhred}
       onChange={onChange}
       min={0}
       max={40}
       step={5}>
        The quality value that a base is qualified. Default 15 means phred
        quality >=Q15 is qualified.
      </NumberRangeInput>
      <NumberRangeInput
       disabled={disableQualityFiltering}
       name="fastpConfig.unqualifiedPercentLimit"
       label="Max % unqualified bases"
       value={unqualifiedPercentLimit}
       defaultValue={defaultFastpConfig.unqualifiedPercentLimit}
       onChange={onChange}
       min={0}
       max={100}
       step={5}>
        How many percents of bases are allowed to be unqualified (0~100).
        Default 40%.
      </NumberRangeInput>
      <NumberRangeInput
       disabled={disableQualityFiltering}
       name="fastpConfig.nBaseLimit"
       label="Max # N bases"
       value={nBaseLimit}
       defaultValue={defaultFastpConfig.nBaseLimit}
       onChange={onChange}
       min={0}
       max={100}
       step={5}>
        If one read's number of N base is greater than this value, then this
        read/pair is discarded. Default is 5.
      </NumberRangeInput>
      <NumberRangeInput
       disabled={disableQualityFiltering}
       name="fastpConfig.averageQual"
       label="Min average phred score"
       value={averageQual}
       defaultValue={defaultFastpConfig.averageQual}
       onChange={onChange}
       min={0}
       max={40}
       step={5}>
        If one read's average quality score is less than this value, then this
        read/pair is discarded. Default 0 means no requirement.
      </NumberRangeInput>
    </fieldset>
    <fieldset>
      <FlagSwitch
       name="fastpConfig.disableLengthFiltering"
       label="Length filtering"
       value={disableLengthFiltering}
       valueChoices={LENGTH_FILTERING_VALUES}
       textChoices={LENGTH_FILTERING_TEXTS}
       onChange={onChange} />
      <NumberRangeInput
       disabled={disableLengthFiltering}
       name="fastpConfig.lengthRequired"
       label="Min read length"
       value={lengthRequired}
       defaultValue={defaultFastpConfig.lengthRequired}
       onChange={onChange}
       min={0}
       max={200}
       step={5}>
        Reads shorter than this value will be discarded, default is 15.
      </NumberRangeInput>
      <NumberRangeInput
       disabled={disableLengthFiltering}
       name="fastpConfig.lengthLimit"
       label="Max read length"
       value={lengthLimit}
       defaultValue={defaultFastpConfig.lengthLimit}
       onChange={onChange}
       min={0}
       max={2000}
       step={5}>
        Reads longer than this value will be discarded, default 0 means no
        limitation.
      </NumberRangeInput>
    </fieldset>
    <fieldset>
      <FlagSwitch
       name="primerType"
       label="Primer trimming"
       value={primerType}
       valueChoices={PRIMER_TYPE_VALUES}
       textChoices={PRIMER_TYPE_TEXTS}
       onChange={onChange}>
        <p>
          Method for trimming primers.{' '}
          <ExtLink
           href="https://cutadapt.readthedocs.io/en/stable/index.html">
            Cutadapt
          </ExtLink> is used if "sequence (FASTA)" primers are provided.
          {' '}
          <ExtLink
           href="https://andersen-lab.github.io/ivar/html/index.html">
            iVar
          </ExtLink> is used if "location (BED)" primers are provided.
        </p>
        <div>
          {primerType === 'fasta' ? <>
            <Markdown inline>{fastaDesc}</Markdown>
            <p><em>
              {primerSeqs.length.toLocaleString('en-US')}{' '}
              {pluralize('primer sequence', primerSeqs.length, false)}{' '}
              {pluralize('is', primerSeqs.length, false)}{' '}
              uploaded/entered. {primerSeqs.length > 3 ? <>
                Scroll up/down to view them all.
              </> : null}
            </em></p>
          </> : null}
          {primerType === 'bed' ? <>
            <Markdown inline>{bedDesc}</Markdown>
            <p><em>
              {primerBeds.length.toLocaleString('en-US')}{' '}
              {pluralize('primer location', primerBeds.length, false)}{' '}
              {pluralize('is', primerBeds.length, false)}{' '}
              uploaded/entered. {primerBeds.length > 3 ? <>
                Scroll up/down to view them all.
              </> : null}
            </em></p>
          </> : null}
          {primerType === 'off' ? <p>
            Primer trimming is turned off since the "off" option is selected.
          </p> : null}
        </div>
      </FlagSwitch>
      {primerType === 'fasta' ? <>
        <PrimerSequenceInput
         name="cutadaptConfig.primerSeqs"
         value={primerSeqs}
         onChange={onChange} />
        <NumberRangeInput
         name="cutadaptConfig.errorRate"
         label="Error tolerance"
         value={errorRate}
         defaultValue={defaultCutadaptConfig.errorRate}
         onChange={onChange}
         min={0}
         max={1}
         step={0.01}>
          Level of error tolerance for allowing mismatches, insertions and
          deletions. Check{' '}
          <ExtLink href={
            "https://cutadapt.readthedocs.io/en/v4.1/guide.html#error-tolerance"
          }>the documentation</ExtLink> for more information. Default is 0.1.
        </NumberRangeInput>
        <FlagSwitch
         name="cutadaptConfig.noIndels"
         label="Indels"
         value={noIndels}
         valueChoices={NO_INDELS_VALUES}
         textChoices={NO_INDELS_TEXTS}
         onChange={onChange}>
          Should insertions and deletions be allowed or disallowed when matching
          primers against reads?
        </FlagSwitch>
        <NumberRangeInput
         name="cutadaptConfig.times"
         label="Max # matched primers"
         value={times}
         defaultValue={defaultCutadaptConfig.times}
         onChange={onChange}
         min={1}
         max={20}
         step={1}>
          Repeat the primer finding and removal step up to given times.{' '}
          <ExtLink href={
            "https://cutadapt.readthedocs.io/en/v4.1/guide.html#more-than-one"
          }>The default is to search for only one primer in each read</ExtLink>.
        </NumberRangeInput>
        <NumberRangeInput
         name="cutadaptConfig.minOverlap"
         label="Min matching length"
         value={minOverlap}
         defaultValue={defaultCutadaptConfig.minOverlap}
         onChange={onChange}
         min={3}
         max={200}
         step={1}>
          Set the <ExtLink href={
            "https://cutadapt.readthedocs.io/en/v4.1/guide.html#minimum-overlap"
          }>minimum</ExtLink> overlap to given length. Default is 3.
        </NumberRangeInput>
      </> : null}
      {primerType === 'bed' ? <>
        <PrimerLocationInput
         name="ivarConfig.primerBeds"
         value={primerBeds}
         onChange={onChange} />
      </> : null}
    </fieldset>
    <fieldset>
      <FlagSwitch
       name="fastpConfig.disableTrimPolyG"
       label="Poly-G trimming"
       value={disableTrimPolyG}
       valueChoices={POLY_G_TRIMMING_VALUES}
       textChoices={POLY_G_TRIMMING_TEXTS}
       onChange={onChange}>
        Enable <ExtLink href={
          'https://support.illumina.com/content/dam/illumina-support/help/' +
          'Illumina_DRAGEN_Bio_IT_Platform_v3_7_1000000141465/Content/SW/' +
          'Informatics/Dragen/PolyG_Trimming_fDG.htm'
        }>polyG tail trimming</ExtLink>. This option should be enabled if
        submitting Illumina NextSeq/NovaSeq data.
      </FlagSwitch>
      <FlagSwitch
       name="fastpConfig.includeUnmerged"
       label="Unpaired reads"
       value={includeUnmerged}
       valueChoices={INCLUDE_UNMERGED_VALUES}
       textChoices={INCLUDE_UNMERGED_TEXTS}
       onChange={onChange}>
        (Paired-end data only) should the unpaired reads be included or
        excluded, default is to be included.
      </FlagSwitch>
    </fieldset>
  </form>;
}
