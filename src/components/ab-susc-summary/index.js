import React from 'react';

import MutationsGroup from './mutations-group';
import Button from '../button';

import style from './style.module.scss';

function getQueryMutations(props) {
  const{
    alignedGeneSequences,
    allGeneSequenceReads
  } = props;
  let geneSeq = {};
  if (alignedGeneSequences) {
    geneSeq = (
      alignedGeneSequences
        .find(({gene: {name}}) => name === 'S') || {}
    );
  }
  else if (allGeneSequenceReads) {
    geneSeq = (
      allGeneSequenceReads
        .find(({gene: {name}}) => name === 'S') || {}
    );
  }
  const {mutations = []} = geneSeq;
  return mutations;
}


function AntibodySuscSummary({
  antibodySuscSummary,
  ...props
}) {
  antibodySuscSummary = antibodySuscSummary
    .filter(({itemsByAntibody}) => itemsByAntibody.length > 0);
  const maxCount = Math.max(
    ...antibodySuscSummary.map(({itemsByAntibody}) => Math.max(
      ...itemsByAntibody.map(({items}) => Math.max(
        ...items.map(({cumulativeCount}) => cumulativeCount)
      ))
    ))
  );
  const containerRef = React.useRef();
  const queryMuts = getQueryMutations(props);

  const [showNumResults, setShowNumResults] = React.useState(3);

  return (
    <div
     ref={containerRef}
     className={style['ab-susc-summary-container']}
     data-num-results={showNumResults}>
      <ul
       className={style['ab-susc-summary']}
       style={{"--max-cumulative-count": maxCount}}>
        {antibodySuscSummary.slice(0, showNumResults).map((item, idx) => (
          <MutationsGroup key={idx} {...item} queryMuts={queryMuts} />
        ))}
      </ul>
      <div className={style['button-group']}>
        {showNumResults < antibodySuscSummary.length ?
          <Button
           btnStyle="info"
           className={style['show-more-results']}
           onClick={showMoreResults}>
            Show more results
          </Button> : null
        }
        {showNumResults > 3 ?
          <Button
           btnStyle="light"
           className={style['collapse-results']}
           onClick={collapseResults}>
            Collapse
          </Button> : null
        }
      </div>
    </div>
  );

  function showMoreResults() {
    let num;
    switch (showNumResults) {
      case 3:
        num = 10;
        break;
      case 10:
        num = 20;
        break;
      default:
        num = antibodySuscSummary.length;
        break;
    }
    setShowNumResults(num);
  }

  function collapseResults() {
    setShowNumResults(3);
    setTimeout(() => {
      const {current} = containerRef;
      if (current && current.scrollIntoView) {
        current.scrollIntoView(false);
      }
    });
  }
}


export default AntibodySuscSummary;
