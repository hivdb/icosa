const geneToDrugClass = {
  'PR': 'PI',
  'RT': 'RTI',
  'IN': 'INSTI'
};

const subtypeDisplayNames = {
  CRF01_AE: 'AE',
  CRF02_AG: 'AG'
};


function toTableRow(mutation, triplet, subtypesForAAs, allSubtypes) {
  const row = {mutation, triplet};
  for (const {name} of allSubtypes) {
    row[`naive${name}`] = [];
    row[`treated${name}`] = [];
  }
  for (
    let {AA, subtypes} of
    [...subtypesForAAs].sort(({AA: a1}, {AA: a2}) => a1 > a2)
  ) {
    for (const {subtype: {name},
      percentageNaive, percentageTreated} of subtypes) {
      const lower = name.toLowerCase();
      if (lower === 'all' || lower === 'other') {
        continue;
      }
      AA = AA.replace('Deletion', 'del').replace('Insertion', 'ins');
      if (AA.indexOf('-') > -1) { AA = 'del'; }
      else if (AA.indexOf('_') > -1) { AA = 'ins'; }
      row[`naive${name}`].push([AA, percentageNaive]);
      row[`treated${name}`].push([AA, percentageTreated]);
    }
  }
  return row;
}


function mutationPrevalencesToTableData(prevalences, allSubtypes) {
  const rowsByGenes = {};
  for (const {
    boundMutation: {
      gene, position, consensus,
      text, triplet
    },
    matched, others
  } of prevalences) {
    const row = toTableRow(text, triplet, matched, allSubtypes);
    const children = [];
    for (
      const {AA, subtypes} of
      [...others].sort(({AA: a1}, {AA: a2}) => a1 > a2)
    ) {
      const child = toTableRow(
        `${consensus}${position}${AA}`, '', [{AA, subtypes}], allSubtypes);
      children.push(child);
    }
    row.children = children;
    rowsByGenes[gene.name] = rowsByGenes[gene.name] || [];
    rowsByGenes[gene.name].push(row);
  }
  return rowsByGenes;
}

export {
  geneToDrugClass, subtypeDisplayNames,
  mutationPrevalencesToTableData
};
