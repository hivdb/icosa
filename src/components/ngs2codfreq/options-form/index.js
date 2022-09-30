import React from 'react';
import PropTypes from 'prop-types';

import ExtLink from '../../link/external';
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
  fastpConfig: fastpConfigShape.isRequired,
  cutadaptConfig: cutadaptConfigShape.isRequired,
  ivarConfig: ivarConfigShape.isRequired,
  primerType: PropTypes.oneOf(['fasta', 'bed', 'off']).isRequired,
  onChange: PropTypes.func.isRequired
};

NGSOptionsForm.defaultProps = {
  fastpConfig: {...defaultFastpConfig},
  cutadaptConfig: {...defaultCutadaptConfig},
  ivarConfig: {...defaultIvarConfig},
  primerType: 'off'
};


export default function NGSOptionsForm({
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
  primerType,
  onChange
}) {

  return <form className={style['ngs-options-form']}>
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
        Method to trim primers. Program{' '}
        <ExtLink
         href="https://cutadapt.readthedocs.io/en/stable/index.html">
          Cutadapt
        </ExtLink> will be used if "sequence (FASTA)" primers are provided.
        Another program{' '}
        <ExtLink
         href="https://andersen-lab.github.io/ivar/html/index.html">
          iVar
        </ExtLink> will be used if "location (BED)" primers are provided.
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
