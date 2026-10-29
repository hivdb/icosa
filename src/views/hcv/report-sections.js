import React from 'react';
import PropTypes from 'prop-types';
import {ReportSection, ValidationReport} from '../../components/report';
import DRMutationByTypes from
  '../../components/report/dr-interpretation/dr-mutation-by-types';
import {mutationGroups} from './drm';
import style from './style.module.scss';

export function ValidationMessages({results = []}) {
  return <ValidationReport validationResults={results || []} />;
}

ValidationMessages.propTypes = {
  results: PropTypes.array
};

export function GeneMutations({geneName, mutations = []}) {
  const geneMutations = mutations || [];
  return <div className={style['gene-mutations']}>
    {geneName ? <h3>{geneName}</h3> : null}
    {geneMutations.length === 0 ? <p>No mutations reported.</p> :
    <ul>{geneMutations.map((mutation, idx) => (
      <li key={idx}>
        {mutation.text}
        {mutation.isDRM ? ' (reported resistance mutation)' : ''}
        {mutation.isUnusual ? ' (unusual)' : ''}
      </li>
    ))}</ul>}
  </div>;
}

GeneMutations.propTypes = {
  geneName: PropTypes.string,
  mutations: PropTypes.array
};

export function ResistanceSummary({geneSequences = []}) {
  return (geneSequences || []).map(({gene, mutations}) => (
    <ReportSection
     key={gene.name}
     title={`Drug resistance interpretation: ${gene.name}`}
     titleAnnotation="HCV DRM list">
      <DRMutationByTypes
       gene={gene}
       mutationsByTypes={mutationGroups(gene.name, mutations)} />
    </ReportSection>
  ));
}

ResistanceSummary.propTypes = {
  geneSequences: PropTypes.array
};
