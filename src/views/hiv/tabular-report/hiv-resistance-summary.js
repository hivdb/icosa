function joinCols(row) {
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


function getObjectTextNoGene(objects) {
  return objects.map(({text}) => text);
}


async function resistanceSummary({
  allGenes,
  sequenceAnalysis,
  currentVersion,
  config
}) {
  const rows = [];
  const {geneDisplay} = config;
  const allGeneNames = allGenes.map(({name}) => name);

  let header = [
    'Sequence Name',
    'Genes'
  ];

  for (const {drugClasses} of allGenes) {
    for (const {name: dcName, drugs, mutationTypes} of drugClasses) {
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
      for (const {displayAbbr} of drugs) {
        header.push(`${displayAbbr} Score`);
        header.push(`${displayAbbr} Level`);
      }
    }
  }

  header.push('Algorithm Name');
  header.push('Algorithm Version');
  header.push('Algorithm Date');

  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      availableGenes: genes,
      drugResistance: geneDRs
    } = seqResult;
    let row = {
      'Sequence Name': seqName,
      'Genes': genes
        .filter(({name}) => allGeneNames.includes(name))
        .map(({name}) => geneDisplay[name] || name),
      'Algorithm Name': currentVersion.family,
      'Algorithm Version': currentVersion.version,
      'Algorithm Date': currentVersion.publishDate
    };

    for (const {
      mutationsByTypes,
      drugScores
    } of geneDRs) {
      for (const {
        drugClass,
        mutationType,
        mutations
      } of mutationsByTypes) {
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
        drug: {displayAbbr},
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
  return [{tableName: 'resistanceSummaries', header, rows}];
}

export default resistanceSummary;
