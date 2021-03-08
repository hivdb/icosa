import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';
import sleep from 'sleep-promise';

import Button from '../button';
import config from '../../config';
import style from './style.module.scss';
import InlineLoader from '../inline-loader';

import SubtypeRow from './subtype-row';
import SinglePrettyPairwise from './pretty-pairwise';
import PromiseComponent from '../../utils/promise-component';


function SDRMs() { return null; }
function PrettyPairwise() { return null; }
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
  geneName,
  geneSeq: {firstAA, lastAA, gene: {name: gene}}
}) {
  return <>
    <dt>Sequence includes {geneName} gene:</dt>
    <dd>codons {firstAA} - {lastAA}</dd>
  </>;
}


function RealGeneMutations({geneName, geneSeq: {mutations}}) {
  return <>
    <dt>{geneName} mutations:</dt>
    <dd>
      {mutations
        .filter(({isUnsequenced}) => !isUnsequenced)
        .map(({text}) => text).join(', ') || 'None'
      }
    </dd>
  </>;
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

  const {showSDRMs, setShowSDRMs} = useState(output === 'printable');
  const {showPrettyPairwise, setShowPrettyPairwise} = useState(false);

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
          {alignedGeneSequences.map((geneSeq, idx) => {
            const geneName = (
              config.geneDisplay[geneSeq.gene.name] || geneSeq.gene.name
            );
            return <React.Fragment key={idx}>
              {children.some(child => child.type === GeneRange) && (
                <RealGeneRange {...{geneName, geneSeq}} />
              )}
              {children.some(child => child.type === GeneMutations) && (
                <RealGeneMutations {...{geneName, geneSeq}} />
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
SequenceSummary.GeneMutations = GeneMutations;
SequenceSummary.Subtype = Subtype;
SequenceSummary.PangolinLineage = PangolinLineage;

export default SequenceSummary;
