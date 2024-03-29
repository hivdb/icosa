import React from 'react';
import gql from 'graphql-tag';
import {matchShape, routerShape} from 'found';
import PropTypes from 'prop-types';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';
import Dropdown from 'react-dropdown';

import ConfigContext from '../../utils/config-context';
import {includeFragment} from '../../utils/graphql-helper';
import Button from '../button';
import style from './style.module.scss';
import DownloadCodFreqs from './download-codfreqs';

// import CodonGraph from './codon-graph';
import CodonReadsCoverage, {query as codonCovQuery} from './codon-coverage';
import SubtypeRow from './subtype-row';

const CUTOFF_OPTIONS = [
  {value: 0.002, label: '0.2%'},
  {value: 0.005, label: '0.5%'},
  {value: 0.01, label: '1%'},
  {value: 0.02, label: '2%'},
  {value: 0.05, label: '5%'},
  {value: 0.1, label: '10%'},
  {value: 0.2, label: '20%'},
  {value: 0.5, label: '50%'}
];

const MINREADS_OPTIONS = [
  {value: 1, label: '(all)'},
  {value: 100, label: '100'},
  {value: 200, label: '200'},
  {value: 500, label: '500'},
  {value: 1000, label: '1,000'},
  {value: 2000, label: '2,000'},
  {value: 5000, label: '5,000'},
  {value: 10000, label: '10,000'}
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


export default function SeqReadsSummaryWrapper(props) {

  return <ConfigContext.Consumer>
    {config => <SeqReadsSummary {...props} config={config} />}
  </ConfigContext.Consumer>;

}


class SeqReadsSummary extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    sequenceReadsResult: PropTypes.shape({
      allGeneSequenceReads: PropTypes.array.isRequired,
      internalJsonCodonReadsCoverage: PropTypes.string.isRequired,
      availableGenes: PropTypes.array.isRequired,
      minPrevalence: PropTypes.number.isRequired,
      cutoffSuggestionLooserLimit: PropTypes.number.isRequired,
      cutoffSuggestionStricterLimit: PropTypes.number.isRequired,
      readDepthStats: PropTypes.shape({
        iqr25: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        iqr75: PropTypes.number.isRequired
      })
    }),
    output: PropTypes.string.isRequired
  };

  static defaultProps = {
    output: 'default'
  };

  constructor() {
    super(...arguments);
    const {output, config} = this.props;
    const showSDRMs = output === 'printable';
    let showCodonCov = (
      output === 'printable' ||
      config.showCodonCov
    );
    this.state = {showSDRMs, showCodonCov};
  }

  handleCutoffChange = ({value: cutoff}) => {
    const newLoc = {...this.props.match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = cutoff;
    this.props.router.push(newLoc);
  };

  handleMinPositionReadsChange = ({value}) => {
    const newLoc = {query: {}, ...this.props.match.location};
    newLoc.query.rd = value;
    this.props.router.push(newLoc);
  };

  toggleSDRMs = () => {
    const showSDRMs = !this.state.showSDRMs;
    this.setState({showSDRMs});
  };

  toggleCodonCov = () => {
    const showCodonCov = !this.state.showCodonCov;
    this.setState({showCodonCov});
  };

  // get myCutoffOptions() {
  //   const {
  //     sequenceReadsResult: {
  //       cutoffSuggestionLooserLimit: lim1,
  //       cutoffSuggestionStricterLimit: lim2,
  //       minPrevalence: lim3
  //     }
  //   } = this.props;
  //   let addLimits = new Set([lim1, lim2, lim3]);
  //   addLimits = Array.from(addLimits).sort();
  //   const myCutoffOptions = [];
  //   let prevValue = 0;
  //   for (const option of CUTOFF_OPTIONS) {
  //     for (const lim of addLimits) {
  //       if (Math.abs(lim - option.value) < 1e-5) {
  //         continue;
  //       }
  //       if (lim > prevValue && lim < option.value) {
  //         myCutoffOptions.push({
  //           value: lim, label: `${(100 * lim).toFixed(2)}%`
  //         });
  //       }
  //     }
  //     myCutoffOptions.push({...option});
  //     prevValue = option.value;
  //   }
  //   return myCutoffOptions;
  // }

  render() {
    const {
      genes,
      config,
      sequenceReadsResult: {
        bestMatchingSubtype,
        subtypes, minPrevalence,
        allGeneSequenceReads,
        internalJsonCodonReadsCoverage,
        minPositionReads, /* cutoffSuggestionLooserLimit,
        cutoffSuggestionStricterLimit,*/
        availableGenes,
        readDepthStats: {median}
      }
    } = this.props;
    const {showSDRMs, showCodonCov} = this.state;

    const disableBtns = availableGenes.length === 0;

    // const {myCutoffOptions} = this;
    let curCutoffOption;
    for (const option of CUTOFF_OPTIONS) {
      if (option.value === minPrevalence) {
        curCutoffOption = option;
        break;
      }
    }
    let curMinReadsDepthOption;
    for (const option of MINREADS_OPTIONS) {
      if (option.value === minPositionReads) {
        curMinReadsDepthOption = option;
        break;
      }
    }

    return <>
      <section className={style['sequence-summary']}>
        <h2>
          Sequence reads summary
        </h2>
        <div className={style['buttons-right']}>
          {config.sdrmButton ?
            <Button
             className={style.button}
             onClick={this.toggleSDRMs} disabled={disableBtns}>
              {showSDRMs ?
                <FaEyeSlash className={style['icon-before-text']} /> :
                <FaEye className={style['icon-before-text']} />} SDRMs
            </Button> : null}
          <DownloadCodFreqs />
          <Button
           className={style.button}
           onClick={this.toggleCodonCov} disabled={disableBtns}>
            {showCodonCov ?
              <FaEyeSlash className={style['icon-before-text']} /> :
              <FaEye className={style['icon-before-text']} />}
            {' '}Read Coverage
          </Button>
        </div>
        <div className={style['desc-list']}>
          <dl>
            {allGeneSequenceReads.map(({
              gene: {name: geneName}, numPositions,
              firstAA, lastAA, mutations
            }, idx) => {
              const gene = config.geneDisplay[geneName];
              const rows = [
                <dt key={`dt-gene-${idx}`}>
                  Sequence includes {gene} gene:
                </dt>,
                <dd key={`dd-gene-${idx}`}>
                  {numPositions} codon positions
                  ({firstAA} … {lastAA})
                </dd>
              ];
              if (config.showMutationsInSummary) {
                rows.push(
                  <dt key={`dt-mut-${idx}`}>
                    {gene} mutations:
                  </dt>
                );
                rows.push(
                  <dd key={`dd-mut-${idx}`}>
                    {mutations
                      .filter(({isUnsequenced}) => !isUnsequenced)
                      .map(({text}) => text)
                      .join(', ') || 'None'
                    }
                  </dd>
                );
              }
              return rows;
            })}
            <dt>Median read depth:</dt>
            <dd>
              {median.toLocaleString()}
            </dd>
            <SubtypeRow {...{bestMatchingSubtype, subtypes}} />
            <dt className={style['has-dropdown']}>Read depth threshold:</dt>
            <dd className={style['has-dropdown']}>
              <Dropdown
               value={curMinReadsDepthOption}
               options={MINREADS_OPTIONS}
               name="minread-depth"
               onChange={this.handleMinPositionReadsChange} />
            </dd>
            {showSDRMs ? allGeneSequenceReads.map(
              ({gene: {name: gene}, sdrms}, idx) => <>
                <dt>{gene} SDRMs:</dt>
                <dd>
                  {sdrms.length > 0 ?
                    sdrms.map(sdrm => sdrm.text).join(', ') :
                    'None'}
                </dd>
              </>
            ) : null}
            <dt className={style['has-dropdown']}>
              Mutation detection threshold:
            </dt>
            <dd className={style['has-dropdown']}>
              <Dropdown
               value={curCutoffOption}
               placeholder="..."
               options={CUTOFF_OPTIONS}
               name="cutoff"
               onChange={this.handleCutoffChange} />
            </dd>
            {/*<dt>Algorithm Cutoffs:</dt>
            <dd>
              {(100 * cutoffSuggestionLooserLimit).toFixed(2)}% -
              {(100 * cutoffSuggestionStricterLimit).toFixed(2)}%
            </dd>*/}
          </dl>
        </div>
      </section>
      {showCodonCov ?
        <CodonReadsCoverage
         {...{genes, internalJsonCodonReadsCoverage, minPositionReads}} /> :
        null}
    </>;
  }
}
