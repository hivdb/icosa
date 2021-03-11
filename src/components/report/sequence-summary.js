import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';
import sleep from 'sleep-promise';

import Button from '../button';
import style from './style.module.scss';
import InlineLoader from '../inline-loader';

import SubtypeRow from './subtype-row';
import SinglePrettyPairwise from './pretty-pairwise';
import PromiseComponent from '../../utils/promise-component';
import ConfigContext from './config-context';


function SDRMs() { return null; }
function PrettyPairwise() { return null; }
function GeneRangeInline() { return null; }
function GeneRange() { return null; }
function GeneMutations() { return null; }
function Subtype() { return null; }
function PangolinLineage() { return null; }


function SDRMButton({disableSDRMs, showSDRMs, toggleSDRMs}) {
  return <Button
   className={style.button}
   onClick={toggleSDRMs} disabled={disableSDRMs}>
    {showSDRMs ?
      <FaEyeSlash className={style['icon-before-text']} /> :
      <FaEye className={style['icon-before-text']} />} SDRMs
  </Button>;
}


function SDRMList({alignedGeneSequences}) {
  return <>
    {alignedGeneSequences.map((geneSeq, idx) => {
      const {gene: {name: gene}, sdrms} = geneSeq;
      return <React.Fragment key={idx}>
        <dt>{gene} SDRMs:</dt>
        <dd>
          {(
            sdrms.length > 0 ?
              sdrms.map(sdrm => sdrm.text).join(", ") :
              "None"
          )}
        </dd>
      </React.Fragment>;
    })}
  </>;
}


function PrettyPairwiseButton({
  disablePrettyPairwise,
  showPrettyPairwise,
  togglePrettyPairwise
}) {

  return <Button
   className={style.button}
   onClick={togglePrettyPairwise}
   disabled={disablePrettyPairwise}>
    {showPrettyPairwise ?
      <FaEyeSlash className={style['icon-before-text']} /> :
      <FaEye className={style['icon-before-text']} />} Pretty pairwise
  </Button>;
}


function PrettyPairwiseList({alignedGeneSequences}) {

  return <div className={style['pretty-pairwise']}>
    {alignedGeneSequences.map(
      ({gene: {name: gene}, prettyPairwise}, idx) => (
        <SinglePrettyPairwise key={idx} {...{gene, prettyPairwise}} />
      )
    )}
  </div>;
}


function RealGeneRange({
  geneSeq: {firstAA, lastAA, gene}
}) {
  return <ConfigContext.Consumer>
    {({geneDisplay}) => <>
      <dt>Sequence includes {geneDisplay[gene.name] || gene.name} gene:</dt>
      <dd>codons {firstAA} - {lastAA}</dd>
    </>}
  </ConfigContext.Consumer>;
}


function RealGeneRangeInline({geneSeqs}) {
  return <ConfigContext.Consumer>
    {({allGenes, geneDisplay, highlightGenes}) => <>
      {geneSeqs.length > 0 ? <>
        <dt>
          Sequence includes following gene
          {geneSeqs.length > 1 ? 's' : null}:
        </dt>
        <dd>
          {geneSeqs.map(({gene, unsequencedRegions: {size, regions}}, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 ? ' · ' : null}
              <span className={classNames(
                style['inline-gene-range'],
                highlightGenes.includes(gene.name) ?
                  style['hl'] : null
              )}>
                <span className={style['gene-name']}>
                  {geneDisplay[gene.name] || gene.name}
                </span>
                {size > 0 ? <>
                  {' (missing: '}
                  {regions.map(
                    ({posStart, posEnd}) => `${posStart}-${posEnd}`
                  ).join(', ')})
                </> : null}
              </span>
            </React.Fragment>
          ))}
        </dd>
      </> : null}
      {geneSeqs.length < allGenes.length && <>
        <dt className={style.warning}>
          Following gene
          {allGenes.length - geneSeqs.length > 1 ? 's are ' : 'is '}
          missing:
        </dt>
        <dd className={style.warning}>
          {allGenes
            .filter(curGene => !geneSeqs.some(
              ({gene}) => gene.name === curGene
            ))
            .map((geneName, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 ? ' · ' : null}
                <span className={classNames(
                  style['inline-gene-range'],
                  highlightGenes.includes(geneName) ?
                    style['hl'] : null
                )}>
                  <span className={style['gene-name']}>
                    {geneDisplay[geneName] || geneName}
                  </span>
                </span>
              </React.Fragment>
            ))
          }
        </dd>
      </>}
    </>}
  </ConfigContext.Consumer>;
}


function RealGeneMutations({geneSeq: {gene, mutations}}) {
  return <ConfigContext.Consumer>
    {({geneDisplay}) => <>
      <dt>{geneDisplay[gene.name] || gene.name} mutations:</dt>
      <dd>
        {mutations
          .filter(({isUnsequenced}) => !isUnsequenced)
          .map(({text}) => text).join(', ') || 'None'
        }
      </dd>
    </>}
  </ConfigContext.Consumer>;
}


function RealPangolinLineage(pangolin) {
  const {
    lineage,
    version,
    loaded,
    asyncResultsURI
  } = pangolin;
  if (loaded) {
    return <>
      <dt>Pangolin lineage:</dt>
      <dd>{lineage} ({version})</dd>
    </>;
  }
  else {
    const asyncResult = async () => {
      do {
        const resp = await fetch(asyncResultsURI);
        if (resp.status !== 200) {
          await sleep(2000);
          continue;
        }
        const {
          version,
          reports: [{lineage}]
        } = await resp.json();
        return {loaded: true, version, lineage};
      }
      while(true); // eslint-disable-line no-constant-condition
    };
    return <>
      <dt>Pangolin lineage:</dt>
      <PromiseComponent
       promise={asyncResult()}
       then={({lineage, version}) => <dd>{lineage} ({version})</dd>}>
        <dd><InlineLoader /></dd>
      </PromiseComponent>
    </>;
  }
}


function SequenceSummary(props) {
  const {
    output,
    sequenceResult: {
      bestMatchingSubtype,
      subtypes,
      alignedGeneSequences,
      availableGenes,
      pangolin
    },
    children
  } = props;

  const [showSDRMs, setShowSDRMs] = useState(output === 'printable');
  const [showPrettyPairwise, setShowPrettyPairwise] = useState(false);

  const disableSDRMs = availableGenes.length === 0;
  const disablePrettyPairwise = availableGenes.length === 0;

  return (
    <section className={style['sequence-summary']}>
      <h2>Sequence summary</h2>
      <div className={style['buttons-right']}>
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
          {children.some(child => child.type === GeneRangeInline) && (
            <RealGeneRangeInline {...{
              geneSeqs: alignedGeneSequences
            }} />
          )}
          {alignedGeneSequences.map((geneSeq, idx) => {
            return <React.Fragment key={idx}>
              {children.some(child => child.type === GeneRange) && (
                <RealGeneRange {...{geneSeq}} />
              )}
              {children.some(child => child.type === GeneMutations) && (
                <RealGeneMutations {...{geneSeq}} />
              )}
            </React.Fragment>;
          })}
          {children.some(child => child.type === Subtype) && (
            <SubtypeRow {...{bestMatchingSubtype, subtypes}} />
          )}
          {children.some(child => child.type === PangolinLineage) && (
            <RealPangolinLineage {...pangolin} />
          )}
          {showSDRMs && children.some(child => child.type === SDRMs) && (
            <SDRMList {...{alignedGeneSequences}} />
          )}
        </dl>
      </div>
      {showPrettyPairwise &&
        children.some(child => child.type === PrettyPairwise) &&
        <PrettyPairwiseList {...{alignedGeneSequences}} />}
    </section>
  );

  function togglePrettyPairwise() {
    setShowPrettyPairwise(!showPrettyPairwise);
  }

  function toggleSDRMs() {
    setShowSDRMs(!showSDRMs);
  }


}

SequenceSummary.propTypes = {
  sequenceResult: PropTypes.shape({
    alignedGeneSequences: PropTypes.array.isRequired,
    availableGenes: PropTypes.array.isRequired
  }),
  children: PropTypes.arrayOf(
    PropTypes.node.isRequired
  ).isRequired,
  output: PropTypes.string.isRequired
};

SequenceSummary.defaultProps = {
  output: 'default',
  children: [
    <SDRMs />,
    <PrettyPairwise />,
    <GeneRange />,
    <Subtype />
  ]
};

SequenceSummary.SDRMs = SDRMs;
SequenceSummary.PrettyPairwise = PrettyPairwise;
SequenceSummary.GeneRange = GeneRange;
SequenceSummary.GeneRangeInline = GeneRangeInline;
SequenceSummary.GeneMutations = GeneMutations;
SequenceSummary.Subtype = Subtype;
SequenceSummary.PangolinLineage = PangolinLineage;

export default SequenceSummary;
