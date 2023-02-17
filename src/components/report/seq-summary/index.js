import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useRouter, matchShape, routerShape} from 'found';

import ConfigContext from '../../../utils/config-context';
import {CutoffKeyPoint} from '../../seqreads-threshold-nomogram';

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
import ThresholdNomogramReal from './threshold-nomogram';
import GenotypeReal from './genotype';


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
const ThresholdNomogram = () => null;
const Genotype = () => null;


SeqSummary.propTypes = {
  config: PropTypes.object,
  headless: PropTypes.bool.isRequired,
  titleWidth: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  output: PropTypes.string,
  name: PropTypes.string,
  cutoffKeyPoints: PropTypes.arrayOf(CutoffKeyPoint.isRequired).isRequired,
  maxMixtureRate: PropTypes.number,
  minPrevalence: PropTypes.number,
  minCodonReads: PropTypes.number,
  assembledConsensus: PropTypes.string,
  bestMatchingSubtype: PropTypes.object,
  subtypes: PropTypes.array,
  alignedGeneSequences: PropTypes.array,
  allGeneSequenceReads: PropTypes.array,
  availableGenes: PropTypes.array,
  pangolin: PropTypes.object,
  readDepthStats: PropTypes.array,
  mixtureRate: PropTypes.number,
  actualMinPrevalence: PropTypes.number,
  minPositionReads: PropTypes.number,
  includeGenes: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  children: PropTypes.node
};


function SeqSummary(props) {
  const {
    config,
    headless,
    titleWidth,
    match,
    router,
    output,
    name,
    cutoffKeyPoints,
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
    includeGenes,
    children
  } = props;

  const geneSeqs = alignedGeneSequences || allGeneSequenceReads || [];

  const [showSDRMs, setShowSDRMs] = useState(output === 'printable');
  const [showPrettyPairwise, setShowPrettyPairwise] = useState(false);

  const disableSDRMs = !availableGenes || availableGenes.length === 0;
  const disablePrettyPairwise = disableSDRMs;
  const childArray = (
    children instanceof Array ? children : [children]
  ).filter(Boolean);

  const togglePrettyPairwise = React.useCallback(() => {
    setShowPrettyPairwise(!showPrettyPairwise);
  }, [showPrettyPairwise]);

  const toggleSDRMs = React.useCallback(() => {
    setShowSDRMs(!showSDRMs);
  }, [showSDRMs]);

  const body = <>
    <div className={style['desc-list']}>
      <dl style={{'--title-width': titleWidth}}>
        {geneSeqs.map((geneSeq, idx) => {
          return <React.Fragment key={idx}>
            {childArray.some(child => child.type === MultilineGeneRange) && (
              <MultilineGeneRangeReal config={config} {...{geneSeq}} />
            )}
            {childArray.some(child => child.type === GeneMutations) && (
              <GeneMutationsReal config={config} {...{geneSeq}} />
            )}
          </React.Fragment>;
        })}
        {childArray.map((child, key) => {
          if (child.type === InlineGeneRange) {
            return (
              <InlineGeneRangeReal {...{key, config, geneSeqs, includeGenes}} />
            );
          }

          else if (child.type === Subtype) {
            return <SubtypeReal {...{key, bestMatchingSubtype, subtypes}} />;
          }

          else if (child.type === MedianReadDepth) {
            return (
              <MedianReadDepthReal
               {...{key, config, readDepthStats, geneSeqs}} />
            );
          }

          else if (child.type === PangoLineage) {
            return (
              <PangoLineageReal key={key} {...pangolin} />
            );
          }

          else if (child.type === Genotype) {
            return (
              <GenotypeReal {...{
                key, config, bestMatchingSubtype, subtypes
              }} />
            );
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
               config={config}
               {...{maxMixtureRate, mixtureRate}} />
            );
          }

          else if (child.type === MinPrevalence) {
            return (
              <MinPrevalenceReal
               key={key}
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
            return <SDRMList {...{key, geneSeqs, config}} />;
          }

          return null;
        })}
      </dl>
    </div>
    {showPrettyPairwise &&
      childArray.some(child => child.type === PrettyPairwise) &&
      <PrettyPairwiseList {...{geneSeqs}} />}
    {childArray.some(child => child.type === ThresholdNomogram) &&
      <ThresholdNomogramReal {...{
        cutoffKeyPoints,
        maxMixtureRate,
        minPrevalence,
        mixtureRate,
        actualMinPrevalence
      }} />}
  </>;

  return <>
    {headless ? body : <section className={style['seq-summary']}>
      <h2>Sequence summary</h2>
      <div className={parentStyle['buttons-right']}>
        {childArray.some(child => child.type === SDRMs) && (
          <SDRMButton {...{disableSDRMs, showSDRMs, toggleSDRMs, config}} />
        )}
        {childArray.some(child => child.type === PrettyPairwise) && (
          <PrettyPairwiseButton {...{
            disablePrettyPairwise,
            showPrettyPairwise,
            togglePrettyPairwise
          }} />
        )}
        {childArray.some(child => child.type === DownloadConsensus) && (
          <DownloadConsensusReal {...{
            name,
            assembledConsensus,
            maxMixtureRate,
            minPrevalence,
            minPositionReads
          }} />
        )}
      </div>
      {body}
    </section>}
  </>;

}

SeqSummary.propTypes = {
  config: PropTypes.object.isRequired,
  headless: PropTypes.bool.isRequired,
  children: PropTypes.arrayOf(
    PropTypes.node.isRequired
  ).isRequired,
  titleWidth: PropTypes.string.isRequired,
  output: PropTypes.string.isRequired
};

SeqSummary.defaultProps = {
  output: 'default',
  headless: false,
  titleWidth: '18rem',
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

SeqSummaryWrapper.SDRMs =
  SeqSummaryWrapper.SDRMs || SDRMs;
SeqSummaryWrapper.DownloadConsensus =
  SeqSummaryWrapper.DownloadConsensus || DownloadConsensus;
SeqSummaryWrapper.PrettyPairwise =
  SeqSummaryWrapper.PrettyPairwise || PrettyPairwise;
SeqSummaryWrapper.MultilineGeneRange =
  SeqSummaryWrapper.MultilineGeneRange || MultilineGeneRange;
SeqSummaryWrapper.InlineGeneRange =
  SeqSummaryWrapper.InlineGeneRange || InlineGeneRange;
SeqSummaryWrapper.GeneMutations =
  SeqSummaryWrapper.GeneMutations || GeneMutations;
SeqSummaryWrapper.Subtype =
  SeqSummaryWrapper.Subtype || Subtype;
SeqSummaryWrapper.PangoLineage =
  SeqSummaryWrapper.PangoLineage || PangoLineage;
SeqSummaryWrapper.OutbreakInfo =
  SeqSummaryWrapper.OutbreakInfo || OutbreakInfo;
SeqSummaryWrapper.MedianReadDepth =
  SeqSummaryWrapper.MedianReadDepth || MedianReadDepth;
SeqSummaryWrapper.MaxMixtureRate =
  SeqSummaryWrapper.MaxMixtureRate || MaxMixtureRate;
SeqSummaryWrapper.MinPrevalence =
  SeqSummaryWrapper.MinPrevalence || MinPrevalence;
SeqSummaryWrapper.MinCodonReads =
  SeqSummaryWrapper.MinCodonReads || MinCodonReads;
SeqSummaryWrapper.MinPositionReads =
  SeqSummaryWrapper.MinPositionReads || MinPositionReads;
SeqSummaryWrapper.ThresholdNomogram =
  SeqSummaryWrapper.ThresholdNomogram || ThresholdNomogram;
SeqSummaryWrapper.Genotype =
  SeqSummaryWrapper.Genotype || Genotype;

export default SeqSummaryWrapper;
