import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import style from './style.module.scss';
import parentStyle from '../style.module.scss';

import {SDRMButton, SDRMList} from './sdrm-list';
import DownloadConsensusReal from './download-consensus';
import {PrettyPairwiseButton, PrettyPairwiseList} from './pretty-pairwise';
import MultilineGeneRangeReal from './multiline-gene-range';
import InlineGeneRangeReal from './inline-gene-range';
import GeneMutationsReal from './gene-mutations';
import PangoLineageReal from './pango-lineage';
import OutbreakInfoReal from './outbreak-info';
import SubtypeReal from './subtype';
import MaxMixtureRateReal from './max-mixture-rate';
import MinPrevalenceReal from './min-prevalence';
import MinCodonReadsReal from './min-codon-reads';
import MinPositionReadsReal from './min-position-reads';
import MedianReadDepthReal from './median-read-depth';
import ConfigContext from '../config-context';


const SDRMs = () => null;
const DownloadConsensus = () => null;
const PrettyPairwise = () => null;
const InlineGeneRange = () => null;
const MultilineGeneRange = () => null;
const GeneMutations = () => null;
const Subtype = () => null;
const PangoLineage = () => null;
const OutbreakInfo = () => null;
const MaxMixtureRate = () => null;
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
    name,
    maxMixtureRate,
    minPrevalence,
    minCodonReads,
    assembledConsensus,
    bestMatchingSubtype,
    subtypes,
    alignedGeneSequences,
    allGeneSequenceReads,
    availableGenes,
    pangolin,
    readDepthStats,
    mixtureRate,
    actualMinPrevalence,
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
        {children.some(child => child.type === DownloadConsensus) && (
          <DownloadConsensusReal {...{
            name,
            assembledConsensus,
            maxMixtureRate,
            minPrevalence,
            minCodonReads
          }} />
        )}
      </div>
      <div className={style['desc-list']}>
        <dl>
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
          {children.map((child, key) => {
            if (child.type === InlineGeneRange) {
              return <InlineGeneRangeReal {...{key, config, geneSeqs}} />;
            }

            else if (child.type === Subtype) {
              return <SubtypeReal {...{key, bestMatchingSubtype, subtypes}} />;
            }

            else if (child.type === MedianReadDepth) {
              return <MedianReadDepthReal {...{key, readDepthStats}} />;
            }

            else if (child.type === PangoLineage) {
              return <PangoLineageReal key={key} {...pangolin} />;
            }

            else if (child.type === OutbreakInfo) {
              return (
                <OutbreakInfoReal
                 key={key}
                 config={config}
                 {...pangolin} />
              );
            }

            else if (child.type === MaxMixtureRate) {
              return (
                <MaxMixtureRateReal
                 key={key}
                 match={match}
                 router={router}
                 config={config}
                 {...{maxMixtureRate, mixtureRate}} />
              );
            }

            else if (child.type === MinPrevalence) {
              return (
                <MinPrevalenceReal
                 key={key}
                 match={match}
                 router={router}
                 config={config}
                 {...{minPrevalence, actualMinPrevalence}} />
              );
            }

            else if (child.type === MinCodonReads) {
              return (
                <MinCodonReadsReal
                 key={key}
                 match={match}
                 router={router}
                 config={config}
                 {...{minCodonReads}} />
              );
            }

            else if (child.type === MinPositionReads) {
              return (
                <MinPositionReadsReal
                 key={key}
                 match={match}
                 router={router}
                 config={config}
                 {...{minPositionReads}} />
              );
            }

            else if (showSDRMs && child.type === SDRMs) {
              return <SDRMList {...{key, geneSeqs}} />;
            }

            return null;
          })}
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
SeqSummaryWrapper.DownloadConsensus = DownloadConsensus;
SeqSummaryWrapper.PrettyPairwise = PrettyPairwise;
SeqSummaryWrapper.MultilineGeneRange = MultilineGeneRange;
SeqSummaryWrapper.InlineGeneRange = InlineGeneRange;
SeqSummaryWrapper.GeneMutations = GeneMutations;
SeqSummaryWrapper.Subtype = Subtype;
SeqSummaryWrapper.PangoLineage = PangoLineage;
SeqSummaryWrapper.OutbreakInfo = OutbreakInfo;
SeqSummaryWrapper.MedianReadDepth = MedianReadDepth;
SeqSummaryWrapper.MaxMixtureRate = MaxMixtureRate;
SeqSummaryWrapper.MinPrevalence = MinPrevalence;
SeqSummaryWrapper.MinCodonReads = MinCodonReads;
SeqSummaryWrapper.MinPositionReads = MinPositionReads;

export default SeqSummaryWrapper;
