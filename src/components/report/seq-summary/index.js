import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import style from './style.module.scss';
import parentStyle from '../style.module.scss';

import {SDRMButton, SDRMList} from './sdrm-list';
import {PrettyPairwiseButton, PrettyPairwiseList} from './pretty-pairwise';
import MultilineGeneRangeReal from './multiline-gene-range';
import InlineGeneRangeReal from './inline-gene-range';
import GeneMutationsReal from './gene-mutations';
import PangolinLineageReal from './pangolin-lineage';
import SubtypeReal from './subtype';
import MinPrevalenceReal from './min-prevalence';
import MinCodonReadsReal from './min-codon-reads';
import MinPositionReadsReal from './min-position-reads';
import MedianReadDepthReal from './median-read-depth';
import ConfigContext from '../config-context';


const SDRMs = () => null;
const PrettyPairwise = () => null;
const InlineGeneRange = () => null;
const MultilineGeneRange = () => null;
const GeneMutations = () => null;
const Subtype = () => null;
const PangolinLineage = () => null;
const MinPrevalence = () => null;
const MinCodonReads = () => null;
const MinPositionReads = () => null;
const MedianReadDepth = () => null;


function SeqSummary(props) {
  const {
    config,
    match,
    router,
    output,
    bestMatchingSubtype,
    subtypes,
    alignedGeneSequences,
    allGeneSequenceReads,
    availableGenes,
    pangolin,
    readDepthStats,
    minPrevalence,
    minCodonReads,
    minPositionReads,
    children
  } = props;

  const geneSeqs = alignedGeneSequences || allGeneSequenceReads;

  const [showSDRMs, setShowSDRMs] = useState(output === 'printable');
  const [showPrettyPairwise, setShowPrettyPairwise] = useState(false);

  const disableSDRMs = availableGenes.length === 0;
  const disablePrettyPairwise = availableGenes.length === 0;

  return (
    <section className={style['seq-summary']}>
      <h2>Sequence summary</h2>
      <div className={parentStyle['buttons-right']}>
        {children.some(child => child.type === SDRMs) && (
          <SDRMButton {...{disableSDRMs, showSDRMs, toggleSDRMs}} />
        )}
        {children.some(child => child.type === PrettyPairwise) && (
          <PrettyPairwiseButton {...{
           disablePrettyPairwise,
           showPrettyPairwise,
           togglePrettyPairwise
          }} />
        )}
      </div>
      <div className={style['desc-list']}>
        <dl>
          {children.some(child => child.type === InlineGeneRange) && (
            <InlineGeneRangeReal config={config} {...{geneSeqs}} />
          )}
          {geneSeqs.map((geneSeq, idx) => {
            return <React.Fragment key={idx}>
              {children.some(child => child.type === MultilineGeneRange) && (
                <MultilineGeneRangeReal config={config} {...{geneSeq}} />
              )}
              {children.some(child => child.type === GeneMutations) && (
                <GeneMutationsReal config={config} {...{geneSeq}} />
              )}
            </React.Fragment>;
          })}
          {children.some(child => child.type === Subtype) && (
            <SubtypeReal {...{bestMatchingSubtype, subtypes}} />
          )}
          {children.some(child => child.type === MedianReadDepth) && (
            <MedianReadDepthReal {...{readDepthStats}} />
          )}
          {children.some(child => child.type === PangolinLineage) && (
            <PangolinLineageReal {...pangolin} />
          )}
          {children.some(child => child.type === MinPrevalence) && (
            <MinPrevalenceReal
             match={match}
             router={router}
             config={config}
             {...{minPrevalence}} />
          )}
          {children.some(child => child.type === MinCodonReads) && (
            <MinCodonReadsReal
             match={match}
             router={router}
             config={config}
             {...{minCodonReads}} />
          )}
          {children.some(child => child.type === MinPositionReads) && (
            <MinPositionReadsReal
             match={match}
             router={router}
             config={config}
             {...{minPositionReads}} />
          )}
          {showSDRMs && children.some(child => child.type === SDRMs) && (
            <SDRMList {...{geneSeqs}} />
          )}
        </dl>
      </div>
      {showPrettyPairwise &&
        children.some(child => child.type === PrettyPairwise) &&
        <PrettyPairwiseList {...{geneSeqs}} />}
    </section>
  );

  function togglePrettyPairwise() {
    setShowPrettyPairwise(!showPrettyPairwise);
  }

  function toggleSDRMs() {
    setShowSDRMs(!showSDRMs);
  }


}

SeqSummary.propTypes = {
  config: PropTypes.object.isRequired,
  children: PropTypes.arrayOf(
    PropTypes.node.isRequired
  ).isRequired,
  output: PropTypes.string.isRequired
};

SeqSummary.defaultProps = {
  output: 'default',
  children: [
    <SDRMs />,
    <PrettyPairwise />,
    <MultilineGeneRange />,
    <Subtype />
  ]
};

const MemoSeqSummary = React.memo(
  SeqSummary,
  ({name: prevName}, {name: nextName}) => prevName === nextName
);

function SeqSummaryWrapper(props) {
  const {match, router} = useRouter();
  return <ConfigContext.Consumer>
    {config => (
      <MemoSeqSummary
       {...props}
       config={config}
       match={match}
       router={router} />
    )}
  </ConfigContext.Consumer>;
}

SeqSummaryWrapper.SDRMs = SDRMs;
SeqSummaryWrapper.PrettyPairwise = PrettyPairwise;
SeqSummaryWrapper.MultilineGeneRange = MultilineGeneRange;
SeqSummaryWrapper.InlineGeneRange = InlineGeneRange;
SeqSummaryWrapper.GeneMutations = GeneMutations;
SeqSummaryWrapper.Subtype = Subtype;
SeqSummaryWrapper.PangolinLineage = PangolinLineage;
SeqSummaryWrapper.MedianReadDepth = MedianReadDepth;
SeqSummaryWrapper.MinPrevalence = MinPrevalence;
SeqSummaryWrapper.MinCodonReads = MinCodonReads;
SeqSummaryWrapper.MinPositionReads = MinPositionReads;

export default SeqSummaryWrapper;
