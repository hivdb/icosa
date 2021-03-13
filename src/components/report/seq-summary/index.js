import React, {useState} from 'react';
import PropTypes from 'prop-types';

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
            <InlineGeneRangeReal {...{geneSeqs}} />
          )}
          {geneSeqs.map((geneSeq, idx) => {
            return <React.Fragment key={idx}>
              {children.some(child => child.type === MultilineGeneRange) && (
                <MultilineGeneRangeReal {...{geneSeq}} />
              )}
              {children.some(child => child.type === GeneMutations) && (
                <GeneMutationsReal {...{geneSeq}} />
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
            <MinPrevalenceReal {...{minPrevalence}} />
          )}
          {children.some(child => child.type === MinCodonReads) && (
            <MinCodonReadsReal {...{minCodonReads}} />
          )}
          {children.some(child => child.type === MinPositionReads) && (
            <MinPositionReadsReal {...{minPositionReads}} />
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

SeqSummary.SDRMs = SDRMs;
SeqSummary.PrettyPairwise = PrettyPairwise;
SeqSummary.MultilineGeneRange = MultilineGeneRange;
SeqSummary.InlineGeneRange = InlineGeneRange;
SeqSummary.GeneMutations = GeneMutations;
SeqSummary.Subtype = Subtype;
SeqSummary.PangolinLineage = PangolinLineage;
SeqSummary.MedianReadDepth = MedianReadDepth;
SeqSummary.MinPrevalence = MinPrevalence;
SeqSummary.MinCodonReads = MinCodonReads;
SeqSummary.MinPositionReads = MinPositionReads;

export default SeqSummary;
