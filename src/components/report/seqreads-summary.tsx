import React, {useState} from 'react';
import gql from 'graphql-tag';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';
import Dropdown from 'react-dropdown';

import ConfigContext from '../../utils/config-context';
import {includeFragment} from '../../utils/graphql-helper';
import Button from '../button';
import style from './style.module.scss';
import useDownloadCodFreqs from './download-codfreqs';
import CodonReadsCoverage, {query as codonCovQuery} from './codon-coverage';
import SubtypeRow from './subtype-row';

const CUTOFF_OPTIONS = [
  {value: '0.002', label: '0.2%'},
  {value: '0.005', label: '0.5%'},
  {value: '0.01', label: '1%'},
  {value: '0.02', label: '2%'},
  {value: '0.05', label: '5%'},
  {value: '0.1', label: '10%'},
  {value: '0.2', label: '20%'},
  {value: '0.5', label: '50%'}
];

const MINREADS_OPTIONS = [
  {value: '1', label: '(all)'},
  {value: '100', label: '100'},
  {value: '200', label: '200'},
  {value: '500', label: '500'},
  {value: '1000', label: '1,000'},
  {value: '2000', label: '2,000'},
  {value: '5000', label: '5,000'},
  {value: '10000', label: '10,000'}
];

const query = gql`
  fragment seqReadsSummaryRootFragment on Root {
    ${includeFragment(codonCovQuery, 'Root')}
  }
  fragment seqReadsSummaryFragment on SequenceReadsAnalysis {
    ${includeFragment(codonCovQuery, 'SequenceReadsAnalysis')}
    allGeneSequenceReads {
      firstAA
      lastAA
      numPositions
    }
  }
  ${codonCovQuery}
`;

export {query};

export interface SeqReadsSummaryProps {
  /** Global configuration options. */
  config: any;
  /** Match object provided by the router. */
  match: any;
  /** Router instance used for navigation. */
  router: any;
  /** Result data from sequence reads analysis. */
  sequenceReadsResult: {
    bestMatchingSubtype?: any;
    subtypes?: any;
    minPrevalence: number;
    allGeneSequenceReads: any[];
    internalJsonCodonReadsCoverage: string;
    minPositionReads: number;
    availableGenes: any[];
    readDepthStats: {median: number; iqr25?: number; iqr75?: number};
  };
  /** Genes definition passed to coverage component. */
  genes?: any;
  /** Output type such as 'printable'. */
  output?: string;
}

/**
 * Wrapper component loading configuration from context before rendering
 * {@link SeqReadsSummary}.
 */
export default function SeqReadsSummaryWrapper(
  props: Omit<SeqReadsSummaryProps, 'config'>
) {
  return (
    <ConfigContext.Consumer>
      {config => <SeqReadsSummary {...props} config={config} />}
    </ConfigContext.Consumer>
  );
}

/**
 * SeqReadsSummary displays a summary of sequence read coverage and detected
 * mutations. Users can toggle the display of SDRMs and codon coverage graphs
 * and adjust cutoffs via drop-down menus.
 *
 * @param props - {@link SeqReadsSummaryProps}
 * @returns Rendered report section summarizing sequence reads.
 */
export function SeqReadsSummary({
  genes,
  config,
  match,
  router,
  sequenceReadsResult,
  output = 'default'
}: SeqReadsSummaryProps) {
  const [showSDRMs, setShowSDRMs] = useState(output === 'printable');
  const [showCodonCov, setShowCodonCov] = useState(
    output === 'printable' || config.showCodonCov
  );

  /**
   * Update the mutation detection cutoff in the URL query params.
   *
   * @param value - Selected cutoff percentage represented as a string.
   */
  const handleCutoffChange = ({value}: {value: string}) => {
    const cutoff = parseFloat(value);
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = cutoff;
    router.push(newLoc);
  };

  /**
   * Update the minimum read depth in the URL query params.
   *
   * @param value - Selected minimum read depth as a string.
   */
  const handleMinPositionReadsChange = ({value}: {value: string}) => {
    const newLoc = {query: {}, ...match.location};
    newLoc.query.rd = parseInt(value, 10);
    router.push(newLoc);
  };

  const toggleSDRMs = () => setShowSDRMs(!showSDRMs);
  const toggleCodonCov = () => setShowCodonCov(!showCodonCov);

  const {
    bestMatchingSubtype,
    subtypes,
    minPrevalence,
    allGeneSequenceReads,
    internalJsonCodonReadsCoverage,
    minPositionReads,
    availableGenes,
    readDepthStats: {median}
  } = sequenceReadsResult;

  const disableBtns = availableGenes.length === 0;

  const {onDownload} = useDownloadCodFreqs(allGeneSequenceReads);

  let curCutoffOption: {value: string; label: string} | undefined;
  for (const option of CUTOFF_OPTIONS) {
    if (parseFloat(option.value) === minPrevalence) {
      curCutoffOption = option;
      break;
    }
  }

  let curMinReadsDepthOption: {value: string; label: string} | undefined;
  for (const option of MINREADS_OPTIONS) {
    if (parseInt(option.value, 10) === minPositionReads) {
      curMinReadsDepthOption = option;
      break;
    }
  }

  return (
    <>
      <section className={style['sequence-summary']}>
        <h2>Sequence reads summary</h2>
        <div className={style['buttons-right']}>
          {config.sdrmButton ? (
            <Button
              className={style.button}
              onClick={toggleSDRMs}
              disabled={disableBtns}
            >
              {showSDRMs ? (
                <FaEyeSlash className={style['icon-before-text']} />
              ) : (
                <FaEye className={style['icon-before-text']} />
              )}{' '}
              SDRMs
            </Button>
          ) : null}
          <Button className={style.button} onClick={onDownload} disabled={disableBtns}>
            Download CodFreqs
          </Button>
          <Button
            className={style.button}
            onClick={toggleCodonCov}
            disabled={disableBtns}
          >
            {showCodonCov ? (
              <FaEyeSlash className={style['icon-before-text']} />
            ) : (
              <FaEye className={style['icon-before-text']} />
            )}
            {' '}Read Coverage
          </Button>
        </div>
        <div className={style['desc-list']}>
          <dl>
            {allGeneSequenceReads.map(
              (
                {
                  gene: {name: geneName},
                  numPositions,
                  firstAA,
                  lastAA,
                  mutations
                },
                idx
              ) => {
                const gene = config.geneDisplay[geneName];
                const rows: React.ReactNode[] = [
                  <dt key={`dt-gene-${idx}`}>Sequence includes {gene} gene:</dt>,
                  <dd key={`dd-gene-${idx}`}>
                    {numPositions} codon positions ({firstAA} … {lastAA})
                  </dd>
                ];
                if (config.showMutationsInSummary) {
                  rows.push(<dt key={`dt-mut-${idx}`}>{gene} mutations:</dt>);
                  rows.push(
                    <dd key={`dd-mut-${idx}`}>
                      {mutations
                        .filter(({isUnsequenced}: any) => !isUnsequenced)
                        .map(({text}: any) => text)
                        .join(', ') || 'None'}
                    </dd>
                  );
                }
                return rows;
              }
            )}
            <dt>Median read depth:</dt>
            <dd>{median.toLocaleString()}</dd>
            <SubtypeRow {...{bestMatchingSubtype, subtypes}} />
            <dt className={style['has-dropdown']}>Read depth threshold:</dt>
            <dd className={style['has-dropdown']}>
              <Dropdown
                value={curMinReadsDepthOption}
                options={MINREADS_OPTIONS}
                onChange={handleMinPositionReadsChange}
              />
            </dd>
            {showSDRMs
              ? allGeneSequenceReads.map(
                  (
                    {gene: {name: gene}, sdrms}: any,
                    idx: number
                  ) => (
                    <React.Fragment key={`sdrm-${gene}-${idx}`}>
                      <dt>{gene} SDRMs:</dt>
                      <dd>
                        {sdrms.length > 0
                          ? sdrms.map((sdrm: any) => sdrm.text).join(', ')
                          : 'None'}
                      </dd>
                    </React.Fragment>
                  )
                )
              : null}
            <dt className={style['has-dropdown']}>
              Mutation detection threshold:
            </dt>
            <dd className={style['has-dropdown']}>
              <Dropdown
                value={curCutoffOption}
                placeholder="..."
                options={CUTOFF_OPTIONS}
                onChange={handleCutoffChange}
              />
            </dd>
          </dl>
        </div>
      </section>
      {showCodonCov ? (
        <CodonReadsCoverage
          {...{genes, internalJsonCodonReadsCoverage, minPositionReads}}
        />
      ) : null}
    </>
  );
}

