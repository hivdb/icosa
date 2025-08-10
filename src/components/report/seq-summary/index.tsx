import React, {useState} from 'react';
import {useRouter} from 'found';

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


const SDRMs: React.FC = () => null;
const DownloadConsensus: React.FC = () => null;
const PrettyPairwise: React.FC = () => null;
const InlineGeneRange: React.FC = () => null;
const MultilineGeneRange: React.FC = () => null;
const GeneMutations: React.FC = () => null;
const Subtype: React.FC = () => null;
const PangoLineage: React.FC = () => null;
const OutbreakInfo: React.FC = () => null;
const MaxMixtureRate: React.FC = () => null;
const MinPrevalence: React.FC = () => null;
const MinCodonReads: React.FC = () => null;
const MinPositionReads: React.FC = () => null;
const MedianReadDepth: React.FC = () => null;
const ThresholdNomogram: React.FC = () => null;
const Genotype: React.FC = () => null;

/**
 * Properties for the {@link SeqSummary} component.
 */
interface SeqSummaryProps {
  config: any;
  headless?: boolean;
  titleWidth?: string;
  match: any;
  router: any;
  output?: string;
  name?: string;
  cutoffKeyPoints: CutoffKeyPoint[];
  maxMixtureRate?: number;
  minPrevalence?: number;
  minCodonReads?: number;
  assembledConsensus?: string;
  bestMatchingSubtype?: any;
  subtypes?: any[];
  alignedGeneSequences?: any[];
  allGeneSequenceReads?: any[];
  availableGenes?: any[];
  pangolin?: any;
  /** Summary of read depth across all genes. */
  readDepthStats?: {median: number} | null;
  mixtureRate?: number;
  actualMinPrevalence?: number;
  minPositionReads?: number;
  includeGenes: string[];
  children?: React.ReactNode | React.ReactNode[];
}

/**
 * Render a summary section for sequence metadata and statistics.
 *
 * @param props - {@link SeqSummaryProps} including various summary elements.
 * @returns Sequence summary section.
 */
function SeqSummary({
  config,
  headless = false,
  titleWidth = '18rem',
  match,
  router,
  output = 'default',
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
  children = [
    <SDRMs />,
    <PrettyPairwise />,
    <MultilineGeneRange />,
    <Subtype />
  ]
}: SeqSummaryProps) {

  const geneSeqs = alignedGeneSequences || allGeneSequenceReads || [];

  const [showSDRMs, setShowSDRMs] = useState(output === 'printable');
  const [showPrettyPairwise, setShowPrettyPairwise] = useState(false);

  const disableSDRMs = !availableGenes || availableGenes.length === 0;
  const disablePrettyPairwise = disableSDRMs;
    const childArray = (
      children instanceof Array ? children : [children]
    ).filter(Boolean) as React.ReactElement[];

  const togglePrettyPairwise = React.useCallback(() => {
    setShowPrettyPairwise(!showPrettyPairwise);
  }, [showPrettyPairwise]);

  const toggleSDRMs = React.useCallback(() => {
    setShowSDRMs(!showSDRMs);
  }, [showSDRMs]);

  const body = <>
    <div className={style['desc-list']}>
        <dl style={{['--title-width' as any]: titleWidth}}>
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
                 {...{
                   key,
                   config,
                   readDepthStats: readDepthStats ?? {median: 0},
                   geneSeqs
                 }} />
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
                 config={config}
                 {...{minCodonReads}} />
              );
            }

            else if (child.type === MinPositionReads) {
              return (
                <MinPositionReadsReal
                 key={key}
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
        maxMixtureRate: maxMixtureRate ?? 0,
        minPrevalence: minPrevalence ?? 0,
        mixtureRate: mixtureRate ?? 0,
        actualMinPrevalence: actualMinPrevalence ?? 0
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
            name: name ?? '',
            assembledConsensus: assembledConsensus ?? '',
            maxMixtureRate: maxMixtureRate ?? 0,
            minPrevalence: minPrevalence ?? 0,
            minPositionReads: minPositionReads ?? 0
          }} />
        )}
      </div>
      {body}
    </section>}
  </>;

}

const MemoSeqSummary = React.memo(
  SeqSummary,
  ({name: prevName}, {name: nextName}) => prevName === nextName
);

interface SeqSummaryWrapperProps
  extends Omit<SeqSummaryProps, 'config' | 'match' | 'router'> {}

interface SeqSummaryWrapperComponent
  extends React.FC<SeqSummaryWrapperProps> {
  SDRMs: React.FC<any>;
  DownloadConsensus: React.FC<any>;
  PrettyPairwise: React.FC<any>;
  MultilineGeneRange: React.FC<any>;
  InlineGeneRange: React.FC<any>;
  GeneMutations: React.FC<any>;
  Subtype: React.FC<any>;
  PangoLineage: React.FC<any>;
  OutbreakInfo: React.FC<any>;
  MedianReadDepth: React.FC<any>;
  MaxMixtureRate: React.FC<any>;
  MinPrevalence: React.FC<any>;
  MinCodonReads: React.FC<any>;
  MinPositionReads: React.FC<any>;
  ThresholdNomogram: React.FC<any>;
  Genotype: React.FC<any>;
}

/**
 * Wrapper around {@link SeqSummary} that injects configuration and routing
 * context.
 */
const SeqSummaryWrapper: SeqSummaryWrapperComponent = (props) => {
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
};

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
SeqSummaryWrapper.ThresholdNomogram = ThresholdNomogram;
SeqSummaryWrapper.Genotype = Genotype;

export default SeqSummaryWrapper;
