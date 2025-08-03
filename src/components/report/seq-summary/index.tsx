import React, {useState, useCallback, ReactElement, ReactNode} from 'react';
import {useRouter} from 'found';

import ConfigContext from '../../../utils/config-context';

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

/**
 * Placeholder components used as markers for enabling optional
 * sections within the sequence summary. They render nothing in the
 * actual output but act as flags when supplied as children.
 */
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

/** Cutoff key point used for plotting threshold curves. */
export interface CutoffKeyPoint {
  /** Mixture rate at the given point. */
  mixtureRate: number;
  /** Minimum prevalence at the given point. */
  minPrevalence: number;
  /** Whether the mixture rate exceeds the threshold. */
  isAboveMixtureRateThreshold: boolean;
  /** Whether the minimum prevalence is below the threshold. */
  isBelowMinPrevalenceThreshold: boolean;
}

/** Props accepted by the core SeqSummary component. */
export interface SeqSummaryProps {
  /** Configuration object from context. */
  config: any;
  /** Render without surrounding section wrapper when true. */
  headless: boolean;
  /** Width of the term column in the description list. */
  titleWidth: string;
  /** Router match object. */
  match: any;
  /** Router instance for navigation. */
  router: any;
  /** Rendering mode. */
  output?: string;
  /** Sequence name. */
  name?: string;
  /** Key points describing the cutoff curve. */
  cutoffKeyPoints: CutoffKeyPoint[];
  /** Configured maximum mixture rate threshold. */
  maxMixtureRate?: number;
  /** Configured minimum prevalence threshold. */
  minPrevalence?: number;
  /** Configured minimum codon reads threshold. */
  minCodonReads?: number;
  /** Assembled consensus sequence. */
  assembledConsensus?: string;
  /** Best matching subtype information. */
  bestMatchingSubtype?: any;
  /** All candidate subtypes. */
  subtypes?: any[];
  /** Aligned gene sequences for the sample. */
  alignedGeneSequences?: any[];
  /** Raw gene sequence reads. */
  allGeneSequenceReads?: any[];
  /** Genes available in the sample. */
  availableGenes?: any[];
  /** PANGOLIN lineage information. */
  pangolin?: any;
  /** Read depth statistics. */
  readDepthStats?: any[];
  /** Observed mixture rate. */
  mixtureRate?: number;
  /** Observed minimum prevalence. */
  actualMinPrevalence?: number;
  /** Minimum reads per position threshold. */
  minPositionReads?: number;
  /** Genes to include in displays. */
  includeGenes: string[];
  /** Child components acting as flags for optional sections. */
  children?: ReactNode | ReactNode[];
}

/**
 * Render the full sequence summary for a report.
 *
 * @param props - {@link SeqSummaryProps} defining data to display.
 * @returns Sequence summary element ready for rendering.
 */
const SeqSummary: React.FC<SeqSummaryProps> = (props) => {
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
    Array.isArray(children) ? children : [children]
  ).filter(Boolean) as ReactElement[];

  const togglePrettyPairwise = useCallback(() => {
    setShowPrettyPairwise(!showPrettyPairwise);
  }, [showPrettyPairwise]);

  const toggleSDRMs = useCallback(() => {
    setShowSDRMs(!showSDRMs);
  }, [showSDRMs]);

  const body = <>
    <div className={style['desc-list']}>
      <dl style={{'--title-width': titleWidth} as any}>
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
              <GenotypeReal {
                ...{
                  key, config, bestMatchingSubtype, subtypes
                }
              } />
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
};

const MemoSeqSummary = React.memo(
  SeqSummary,
  ({name: prevName}: SeqSummaryProps, {name: nextName}: SeqSummaryProps) =>
    prevName === nextName
);

/**
 * Props for the exported wrapper which injects router and configuration
 * context into the core component.
 */
export type SeqSummaryWrapperProps = Omit<
  SeqSummaryProps,
  'config' | 'match' | 'router'
> & {
  headless?: boolean;
  titleWidth?: string;
  output?: string;
  children?: ReactNode | ReactNode[];
};

const defaultChildren: ReactElement[] = [
  <SDRMs />,
  <PrettyPairwise />,
  <MultilineGeneRange />,
  <Subtype />
];

/**
 * Wrapper component supplying router and configuration context to
 * {@link SeqSummary} while providing sensible defaults for optional
 * properties.
 *
 * @param props - {@link SeqSummaryWrapperProps} excluding router and
 * context which are injected internally.
 * @returns Wrapped sequence summary component.
 */
const SeqSummaryWrapperBase: React.FC<SeqSummaryWrapperProps> = ({
  headless = false,
  titleWidth = '18rem',
  output = 'default',
  children = defaultChildren,
  ...rest
}) => {
  const {match, router} = useRouter();
  return <ConfigContext.Consumer>
    {config => (
      <MemoSeqSummary
       {...rest as any}
       config={config}
       match={match}
       router={router}
       headless={headless}
       titleWidth={titleWidth}
       output={output}
       children={children}
      />
    )}
  </ConfigContext.Consumer>;
};

interface SeqSummaryWrapperComponent extends React.FC<SeqSummaryWrapperProps> {
  SDRMs: typeof SDRMs;
  DownloadConsensus: typeof DownloadConsensus;
  PrettyPairwise: typeof PrettyPairwise;
  MultilineGeneRange: typeof MultilineGeneRange;
  InlineGeneRange: typeof InlineGeneRange;
  GeneMutations: typeof GeneMutations;
  Subtype: typeof Subtype;
  PangoLineage: typeof PangoLineage;
  OutbreakInfo: typeof OutbreakInfo;
  MedianReadDepth: typeof MedianReadDepth;
  MaxMixtureRate: typeof MaxMixtureRate;
  MinPrevalence: typeof MinPrevalence;
  MinCodonReads: typeof MinCodonReads;
  MinPositionReads: typeof MinPositionReads;
  ThresholdNomogram: typeof ThresholdNomogram;
  Genotype: typeof Genotype;
}

const SeqSummaryWrapper =
  SeqSummaryWrapperBase as SeqSummaryWrapperComponent;

SeqSummaryWrapper.SDRMs = SeqSummaryWrapper.SDRMs || SDRMs;
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
SeqSummaryWrapper.Subtype = SeqSummaryWrapper.Subtype || Subtype;
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
SeqSummaryWrapper.Genotype = SeqSummaryWrapper.Genotype || Genotype;

export default SeqSummaryWrapper;
