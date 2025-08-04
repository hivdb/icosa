/**
 * Mapping from gene to corresponding drug class.
 */
const geneToDrugClass: Record<string, string> = {
  PR: 'PI',
  RT: 'RTI',
  IN: 'INSTI'
};

/**
 * Display names for specific subtypes.
 */
const subtypeDisplayNames: Record<string, string> = {
  CRF01_AE: 'AE',
  CRF02_AG: 'AG'
};

interface Subtype {
  name: string;
  stats?: any;
}

interface PrevalenceEntry {
  boundMutation: {
    gene: {name: string};
    position: number;
    reference: string;
    text: string;
    triplet: string;
  };
  matched: any[];
  others: any[];
}

/**
 * Convert mutation prevalence data into table rows grouped by gene.
 *
 * @param prevalences - List of prevalence entries.
 * @param allSubtypes - List of subtype statistics.
 * @returns Object keyed by gene names with array of row data.
 */
function mutationPrevalencesToTableData(
  prevalences: PrevalenceEntry[],
  allSubtypes: Subtype[]
): Record<string, any[]> {
  const rowsByGenes: Record<string, any[]> = {};
  for (const [rowId, {
    boundMutation: {
      gene,
      position,
      reference,
      text,
      triplet
    },
    matched, others
  }] of prevalences.entries()) {
    const row = toTableRow(text, triplet, matched, allSubtypes);
    const children: any[] = [];
    for (const {AA, subtypes} of [...others].sort(({AA: a1}, {AA: a2}) => a1 > a2)) {
      const child = toTableRow(
        `${reference}${position}${AA}`,
        '',
        [{AA, subtypes}],
        allSubtypes
      );
      children.push({
        ...child,
        parentRowId: rowId
      });
    }
    (row as any).rowId = rowId;
    (row as any).children = children;
    (row as any).showChildren = false;
    rowsByGenes[gene.name] = rowsByGenes[gene.name] || [];
    rowsByGenes[gene.name].push(row);
  }
  return rowsByGenes;
}

function toTableRow(
  mutation: string,
  triplet: string,
  subtypesForAAs: any[],
  allSubtypes: Subtype[]
) {
  const row: any = {mutation, triplet};
  for (const {name} of allSubtypes) {
    row[`naive${name}`] = [];
    row[`treated${name}`] = [];
  }
  for (
    let {AA, subtypes} of
    [...subtypesForAAs].sort(({AA: a1}, {AA: a2}) => a1 > a2)
  ) {
    for (const {
      subtype: {name},
      percentageNaive, percentageTreated
    } of subtypes) {
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

export {
  geneToDrugClass,
  subtypeDisplayNames,
  mutationPrevalencesToTableData
};
