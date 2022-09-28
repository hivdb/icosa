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


NGSOptionsForm.propTypes = {
  fastpConfig: fastpConfigShape.isRequired,
  cutadaptConfig: cutadaptConfigShape.isRequired,
  ivarConfig: ivarConfigShape.isRequired,
  onChange: PropTypes.func.isRequired
};

NGSOptionsForm.defaultProps = {
  fastpConfig: {...defaultFastpConfig},
  cutadaptConfig: {...defaultCutadaptConfig},
  ivarConfig: {...defaultIvarConfig}
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
  onChange
}) {

  return <form className={style['ngs-options-form']}>
    <fieldset>
      <FlagSwitch
       trueWhenDisabled
       name="fastpConfig.disableAdapterTrimming"
       label="Adapter trimming"
       flag={disableAdapterTrimming}
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
       trueWhenDisabled
       name="fastpConfig.disableQualityFiltering"
       label="Quality filtering"
       flag={disableQualityFiltering}
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
       label="Max # N base"
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
       trueWhenDisabled
       name="fastpConfig.disableLengthFiltering"
       label="Length filtering"
       flag={disableLengthFiltering}
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
       trueWhenDisabled
       name="fastpConfig.disableTrimPolyG"
       label="Poly-G trimming"
       flag={disableTrimPolyG}
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
       flag={includeUnmerged}
       textEnable="Include"
       textDisable="Exclude"
       onChange={onChange}>
        (Paired-end data only) should the unpaired reads be included or
        excluded, default is to be included.
      </FlagSwitch>
    </fieldset>
  </form>;
}
