import React from 'react';

import ReportSection from '../report-section';
import DRMutationByTypes from './dr-mutation-by-types';
import DRCommentByTypes from '../dr-comment-by-types';
import DRLevels from './dr-levels';

import style from './style.module.scss';

interface Algorithm {
  family: string;
  version: string;
  publishDate: string;
}

interface Gene {
  name: string;
  drugClasses: {name: string; fullName: string}[];
}

interface GeneDR {
  gene: Gene;
  levels: {drug: {name: string; fullName: string; displayAbbr: string}; text: string; drugClass: {name: string}}[];
  algorithm: Algorithm;
  mutationsByTypes: any[];
  commentsByTypes: any[];
}

interface DRInterpretationProps {
  geneDR: GeneDR;
  output?: string;
  suppressDRI?: boolean;
  suppressLevels?: boolean;
  disabledDrugs?: string[];
}

/**
 * Top-level wrapper to render drug-resistance interpretation sections for a gene.
 */
export default function DRInterpretation({
  suppressLevels = false,
  suppressDRI = false,
  geneDR,
  output = 'default',
  disabledDrugs = []
}: DRInterpretationProps) {
  const {algorithm, gene} = geneDR;

  return (
    <ReportSection
      title={`Drug resistance interpretation: ${gene.name}`}
      titleAnnotation={
        <>
          {algorithm.family} {algorithm.version} ({algorithm.publishDate})
        </>
      }
    >
      <DRMutationByTypes {...geneDR} {...{output}} />
      {suppressDRI ? (
        <p>
          Drug resistance interpretation is suppressed due to failed quality assessment (severe warning).
        </p>
      ) : (
        <>
          {suppressLevels ? null : (
            <div className={style['dr-levels']}>
              {gene.drugClasses.map((drugClass, idx) => (
                <DRLevels
                  key={idx}
                  {...{output, drugClass, disabledDrugs}}
                  levels={geneDR.levels.filter(ds => ds.drugClass.name === drugClass.name)}
                />
              ))}
            </div>
          )}
          <DRCommentByTypes {...{output, disabledDrugs, ...geneDR}} />
        </>
      )}
    </ReportSection>
  );
}
