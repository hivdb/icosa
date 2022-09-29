import PropTypes from 'prop-types';


const fastpConfigShape = PropTypes.shape({
  includeUnmerged: PropTypes.bool.isRequired,
  qualifiedQualityPhred: PropTypes.number.isRequired,
  unqualifiedPercentLimit: PropTypes.number.isRequired,
  nBaseLimit: PropTypes.number.isRequired,
  averageQual: PropTypes.number.isRequired,
  lengthRequired: PropTypes.number.isRequired,
  lengthLimit: PropTypes.number.isRequired,
  adapterSequence: PropTypes.string.isRequired,
  adapterSequenceR2: PropTypes.string.isRequired,
  disableAdapterTrimming: PropTypes.bool.isRequired,
  disableTrimPolyG: PropTypes.bool.isRequired,
  disableQualityFiltering: PropTypes.bool.isRequired,
  disableLengthFiltering: PropTypes.bool.isRequired
});

const defaultFastpConfig = {
  includeUnmerged: true,
  qualifiedQualityPhred: 15,
  unqualifiedPercentLimit: 40,
  nBaseLimit: 5,
  averageQual: 0,
  lengthRequired: 15,
  lengthLimit: 0,
  adapterSequence: 'auto',
  adapterSequenceR2: 'auto',
  disableAdapterTrimming: false,
  disableTrimPolyG: false,
  disableQualityFiltering: false,
  disableLengthFiltering: false
};

const primerSeqShape = PropTypes.shape({
  idx: PropTypes.number.isRequired,
  header: PropTypes.string.isRequired,
  sequence: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['three-end', 'five-end', 'both-end']).isRequired
});

const cutadaptConfigShape = PropTypes.shape({
  primerSeqs: PropTypes.arrayOf(
    primerSeqShape.isRequired
  ).isRequired,
  errorRate: PropTypes.number.isRequired,
  noIndels: PropTypes.bool.isRequired,
  times: PropTypes.number.isRequired,
  minOverlap: PropTypes.number.isRequired
});

const defaultCutadaptConfig = {
  primerSeqs: [],
  errorRate: 0.1,
  noIndels: true,
  times: 1,
  minOverlap: 3
};


const ivarConfigShape = PropTypes.shape({
  primersBed: PropTypes.arrayOf(
    PropTypes.shape({
      chrom: PropTypes.string.isRequired,
      chromStart: PropTypes.number.isRequired,
      chromEnd: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      strand: PropTypes.oneOf(['+', '-']).isRequired
    }).isRequired
  ).isRequired,
  minLength: PropTypes.number.isRequired,
  minQuality: PropTypes.number.isRequired,
  includeReadsWithNoPrimers: PropTypes.bool.isRequired
});

const defaultIvarConfig = {
  primersBed: [],
  minLength: 0, // ivar should only perform primer trimming
  minQuality: 0, //
  includeReadsWithNoPrimers: true
};


export {
  fastpConfigShape,
  defaultFastpConfig,
  primerSeqShape,
  cutadaptConfigShape,
  defaultCutadaptConfig,
  ivarConfigShape,
  defaultIvarConfig
};
