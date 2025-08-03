import React from 'react';
import gql from 'graphql-tag.macro';

import CodonCoverageGraph from './codon-coverage-graph';
import style from './style.module.scss';

export interface Gene {
  strain: { name: string };
  name: string;
  length: number;
}

export interface CodonReadsCoverageProps {
  genes: Gene[];
  internalJsonCodonReadsCoverage: string;
  minPositionReads?: number;
}

/**
 * Displays a bar chart of codon read coverage for the provided genes.
 */
const CodonReadsCoverage: React.FC<CodonReadsCoverageProps> = ({
  genes,
  internalJsonCodonReadsCoverage,
  minPositionReads
}) => {
  const codonReadsCoverage = JSON.parse(internalJsonCodonReadsCoverage);
  const width = genes.reduce((acc, { length }) => acc + length * 5, 0);
  const availableGenes: Gene[] = [];
  for (const gene of genes) {
    const { name } = gene;
    if (codonReadsCoverage.some((cc: any) => cc.gene.name === name)) {
      availableGenes.push(gene);
    }
  }

  return (
    <section className={style['codon-reads-coverage']}>
      <h2>Codon read coverage</h2>
      <div className={style['graph-container']}>
        <CodonCoverageGraph
          containerWidth={width}
          genes={availableGenes}
          {...{
            codonReadsCoverage,
            minPositionReads
          }}
        />
      </div>
    </section>
  );
};

export default CodonReadsCoverage;

export const query = gql`
  fragment codonReadsCoverageFragment on SequenceReadsAnalysis {
    internalJsonCodonReadsCoverage
  }
  fragment codonReadsCoverageRootFragment on Root {
    genes {
      strain { name }
      name
      length
    }
  }
`;
