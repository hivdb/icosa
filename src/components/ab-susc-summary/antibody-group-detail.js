import React from 'react';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

import ExtLink from '../link/external';

import style from './style.module.scss';

const DISPLAY_RLEVELS = [
  ['Susceptible', 'susceptible', 'fold ≤ 3'],
  ['Partial resistance', 'partial-resistance', '3 < fold ≤ 10'],
  ['Resistant', 'resistant', 'fold > 10']
];


function AntibodyGroupDetail({antibodies, items, display}) {

  return (
    <div
     className={style['detail-box']}
     data-display={display}>
      {display && <>
        <div className={style['group-name']}>
          <strong>MAb name</strong>{': '}
          {antibodies.map(({name, abbrName, synonyms}, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 ?
                <span className={style['inline-divider']}>+</span> : null}
              {name}
              {abbrName || synonyms.length > 0 ? <> ({
                uniq([abbrName, ...synonyms]).join(', ')
              })</> : null}
            </React.Fragment>
          ))}
        </div>
        <div className={style['availability']}>
          <strong>Availability</strong>{': '}
          {uniq(antibodies.map(({availability}) => availability)).join('/')}
        </div>
        {antibodies.some(({target}) => target) ?
          <div className={style['target']}>
            <strong>Target</strong>{': '}
            {uniq(
              antibodies
                .map(({target}) => target)
                .filter(target => target)
            ).join('/')}
          </div> : null}
        {antibodies.some(({antibodyClass}) => antibodyClass) ?
          <div className={style['antibody-class']}>
            <strong>Class</strong>{': '}
            {uniq(
              antibodies
                .map(({antibodyClass}) => antibodyClass)
                .filter(cls => cls)
            ).join('/')}
          </div> : null}

        <div className={style['rlevel-detail']}>
          <strong>Resistance levels</strong>{': '}
          <ul className={style['rlevel-list']}>
            {DISPLAY_RLEVELS.map(([displayName, level, criteria]) => (
              <li className={style['rlevel-item']} key={level}>
                <span className={style['rlevel']} data-level={level}>
                  {displayName} ({criteria})
                </span>
                {' was reported by '}
                {(() => {
                  const {
                    cumulativeCount = 0,
                    items: results = []
                  } = items.find(item => item.resistanceLevel === level) || {};
                  const resultsByRef = groupBy(
                    results, sr => sr.reference.refName
                  );
                  const numRefs = Object.keys(resultsByRef).length;
                  let desc;
                  if (cumulativeCount === 0) {
                    desc = <><strong>0</strong> study.</>;
                  }
                  else if (cumulativeCount === 1) {
                    desc = <><strong>1</strong> study:</>;
                  }
                  else if (cumulativeCount === numRefs) {
                    desc = <><strong>{cumulativeCount}</strong> studies:</>;
                  }
                  else if (numRefs === 1) {
                    desc = <>
                      <strong>{cumulativeCount}</strong> results
                      from <strong>1</strong> study:
                    </>;
                  }
                  else {
                    desc = <>
                      <strong>{cumulativeCount}</strong> results
                      from <strong>{numRefs}</strong> studies:
                    </>;
                  }
                  return <>
                    {desc}
                    {numRefs > 0 && <ul className={style['ref-list']}>
                      {Object.values(resultsByRef).map((results, idx) => (
                        <li key={idx} className={style['ref-item']}>
                          {(() => {
                            let [{reference: {refName, DOI, URL}}] = results;
                            if (DOI) {
                              URL = `https://doi.org/${DOI}`;
                            }
                            return <ExtLink href={URL}>{refName}</ExtLink>;
                          })()}
                          <ul className={style['susc-list']}>
                            {results.map(({
                              assay,
                              section,
                              foldCmp,
                              fold,
                              ineffective,
                              cumulativeCount
                            }, idx) => (
                              <li key={idx} className={style['susc-item']}>
                                {ineffective ? <em>Ineffective</em> : (
                                  fold === null ?
                                    <em>(Qualitative result)</em> :
                                    <>fold{foldCmp}{fold}</>
                                )}{' '}
                                ({cumulativeCount > 1 ?
                                  <>n={cumulativeCount}; </> : null}
                                {assay ? assay : 'pseudovirus'}{'; '}
                                <em>{section}</em>)
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>}
                  </>;
                })()}
              </li>
            ))}
          </ul>
        </div>
      </>}
    </div>
  );

}


export default AntibodyGroupDetail;
