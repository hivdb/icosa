/**
 * Join all array values in the row into comma separated strings.
 */
function joinCols(row: Record<string, any>): void {
  for (const col of Object.keys(row)) {
    if (row[col] instanceof Array) {
      if (row[col].length > 0) {
        row[col] = row[col].join(',');
      }
      else if (col in row) {
        row[col] = 'None';
      }
    }
  }
}

/** Extract text field from objects. */
function getObjectTextNoGene(objects: Array<{text: string}>): string[] {
  return objects.map(({ text }) => text);
}

/**
 * Build resistance summary table rows.
 *
 * @param args - Analysis results and configuration.
 * @returns Table definition for export.
 */
async function resistanceSummary({
  allGenes,
  sequenceReadsAnalysis,
  sequenceAnalysis,
  currentVersion,
  config
}: any): Promise<any[]> {
  const rows: Record<string, any>[] = [];
  const { geneDisplay } = config;
  const allGeneNames = allGenes.map(({ name }) => name);

  let header: string[] = ['Sequence Name', 'Genes'];

  for (const { drugClasses } of allGenes) {
    for (const { name: dcName, drugs, mutationTypes } of drugClasses) {
      for (const mtype of mutationTypes) {
        if (mtype === 'Other') {
          continue;
        }
        if (mtype === dcName) {
          header.push(mtype);
        }
        else {
          header.push(`${dcName} ${mtype}`);
        }
      }
      for (const { displayAbbr } of drugs) {
        header.push(`${displayAbbr} Score`);
        header.push(`${displayAbbr} Level`);
      }
    }
  }

  header.push('Algorithm Name');
  header.push('Algorithm Version');
  header.push('Algorithm Date');

  for (const seqResult of sequenceAnalysis || sequenceReadsAnalysis) {
    const {
      name: seqName1,
      inputSequence: { header: seqName2 } = {},
      availableGenes: genes,
      drugResistance: geneDRs
    } = seqResult;
    const row: Record<string, any> = {
      'Sequence Name': seqName1 || seqName2,
      'Genes': genes
        .filter(({ name }) => allGeneNames.includes(name))
        .map(({ name }) => geneDisplay[name] || name),
      'Algorithm Name': currentVersion.family,
      'Algorithm Version': currentVersion.version,
      'Algorithm Date': currentVersion.publishDate
    };

    for (const { mutationsByTypes, drugScores } of geneDRs) {
      for (const { drugClass, mutationType, mutations } of mutationsByTypes) {
        if (mutationType === 'Other') {
          continue;
        }
        let mutTypeHdr;
        if (mutationType === drugClass.name) {
          mutTypeHdr = mutationType;
        }
        else {
          mutTypeHdr = `${drugClass.name} ${mutationType}`;
        }
        row[mutTypeHdr] = getObjectTextNoGene(mutations);
      }
      for (const {
        drug: { displayAbbr },
        score,
        level
      } of drugScores) {
        row[`${displayAbbr} Score`] = `${score}`;
        row[`${displayAbbr} Level`] = `${level}`;
      }
    }
    joinCols(row);

    rows.push(row);
  }
  return [{ tableName: 'resistanceSummaries', header, rows }];
}

export default resistanceSummary;
