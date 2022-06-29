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


function getObjectText(objects) {
  return objects.map(({text, gene: {name}}) => `${name}:${text}`);
}


function getObjectTextNoGene(objects) {
  return objects.map(({text}) => text);
}


function getPermanentLink(seqName, mutations, patternsTo) {
  const mutText = getObjectText(mutations).join(',');
  const link = new URL(patternsTo, window.location.href);
  const query = new URLSearchParams();
  query.set('name', seqName);
  query.set('mutations', mutText);
  link.search = query.toString();
  return link.toString();
}


async function seqSummary({
  allGenes,
  sequenceReadsAnalysis,
  sequenceAnalysis,
  config,
  patternsTo
}) {
  const rows = [];
  const {geneDisplay} = config;
  const mutTypeHeaders = allGenes.reduce(
    (acc, {name: geneName, drugClasses}) => [
      ...acc,
      ...drugClasses.reduce(
        (acc2, {name: dcName, mutationTypes}) => [
          ...acc2,
          ...mutationTypes
            .filter(mtype => mtype !== 'Other')
            .map(mtype => mtype === dcName ? mtype : `${dcName} ${mtype}`)
        ],
        []
      ),
      `${geneName} Other`
    ],
    []
  );
  const allGeneNames = allGenes.map(({name}) => name);

  const header = [
    'Sequence Name',
    'Genes',
    ...allGenes.reduce(
      (acc, {name}) => [
        ...acc,
        `${name} Start`,
        `${name} End`
      ],
      []
    ),
    'Subtype (%)',
    ...(sequenceReadsAnalysis ? [
      'Median Read Depth'
    ] : []),
    'NA Mixture Rate (%)',
    ...mutTypeHeaders,
    ...allGenes.reduce(
      (acc, {drugClasses}) => [
        ...acc,
        ...drugClasses
          .filter(
            ({hasSurveilDrugResistMutations: hasSDRMs}) => hasSDRMs
          )
          .map(({name}) => `${name} SDRMs`)
      ],
      []
    ),
    ...allGenes.reduce(
      (acc, {drugClasses}) => [
        ...acc,
        ...drugClasses
          .filter(({hasRxSelectedMutations: hasTSMs}) => hasTSMs)
          .map(({name}) => `${name} TSMs`)
      ],
      []
    ),
    ...(sequenceAnalysis ? [
      'Num Frame Shifts',
      'Frame Shifts'
    ] : []),
    'Num Insertions',
    'Insertions',
    'Num Deletions',
    'Deletions',
    'Num Stop Codons',
    'Stop Codons',
    'Num Ambiguous',
    'Ambiguous',
    'Num Apobec Mutations',
    'Apobec Mutations',
    'Num Unusual Mutations',
    'Unusual Mutations',
    'Permanent Link',
    ...(sequenceReadsAnalysis ? [
      'Minimal Read Depth',
      'NA Mixture Threshold',
      'Mutation Detection Threshold',
      'Applied Mutation Detection Threshold'
    ] : [])
  ];

  for (const seqResult of sequenceAnalysis || sequenceReadsAnalysis) {
    const {
      name: seqName1,
      inputSequence: {header: seqName2} = {},
      readDepthStats = {},
      availableGenes: genes,
      bestMatchingSubtype,
      maxMixtureRate,
      minPrevalence,
      mixtureRate,
      actualMinPrevalence,
      minPositionReads,
      alignedGeneSequences: geneSeqs1,
      allGeneSequenceReads: geneSeqs2,
      drugResistance: geneDRs,
      mutations,
      unusualMutations,
      frameShifts,
      insertions,
      deletions,
      stopCodons,
      ambiguousMutations,
      apobecMutations
    } = seqResult;
    let row = {
      'Sequence Name': seqName1 || seqName2,
      'Genes': genes
        .filter(({name}) => allGeneNames.includes(name))
        .map(({name}) => geneDisplay[name] || name),
      'Subtype (%)': (bestMatchingSubtype || {}).display || null,
      'Median Read Depth': readDepthStats.median,
      'NA Mixture Rate (%)': (100 * mixtureRate).toFixed(2),
      'Insertions': getObjectText(insertions),
      'Num Insertions': `${insertions.length}`,
      'Deletions': getObjectText(deletions),
      'Num Deletions': `${deletions.length}`,
      'Stop Codons': getObjectText(stopCodons),
      'Num Stop Codons': `${stopCodons.length}`,
      'Ambiguous': getObjectText(ambiguousMutations),
      'Num Ambiguous': `${ambiguousMutations.length}`,
      'Apobec Mutations': getObjectText(apobecMutations),
      'Num Apobec Mutations': `${apobecMutations.length}`,
      'Unusual Mutations': getObjectText(unusualMutations),
      'Num Unusual Mutations': `${unusualMutations.length}`,

      'Permanent Link': getPermanentLink(
        seqName1 || seqName2,
        mutations,
        patternsTo
      ),
      'Minimal Read Depth': minPositionReads,
      'NA Mixture Threshold': `≤${maxMixtureRate * 100}%`,
      'Mutation Detection Threshold': `≥${minPrevalence * 100}%`,
      'Applied Mutation Detection Threshold':
      `${(actualMinPrevalence * 100).toFixed(1)}%`
    };
    if (frameShifts) {
      row['Frame Shifts'] = getObjectText(frameShifts);
      row['Num Frame Shifts'] = `${frameShifts.length}`;
    }
    for (const {gene: {name: geneName}, mutationsByTypes} of geneDRs) {
      for (const {
        drugClass,
        mutationType,
        mutations
      } of mutationsByTypes) {
        let mutTypeHdr;
        if (drugClass) {
          if (drugClass.name === mutationType) {
            mutTypeHdr = mutationType;
          }
          else {
            mutTypeHdr = `${drugClass.name} ${mutationType}`;
          }
        }
        else {
          mutTypeHdr = `${geneName} ${mutationType}`;
        }
        row[mutTypeHdr] = getObjectTextNoGene(mutations);
      }
    }
    for (const {
      gene: {name: geneText},
      firstAA,
      lastAA,
      sdrms,
      tsms
    } of geneSeqs1 || geneSeqs2) {
      row[`${geneText} Start`] = firstAA;
      row[`${geneText} End`] = lastAA;
      const {drugClasses} = allGenes.find(({name}) => geneText === name);
      for (const {name: dcText} of drugClasses) {
        row[`${dcText} SDRMs`] = getObjectTextNoGene(
          sdrms.filter(({SDRMDrugClass: {name}}) => dcText === name)
        );
        row[`${dcText} TSMs`] = getObjectTextNoGene(
          tsms.filter(({TSMDrugClass: {name}}) => dcText === name)
        );
      }
    }
    joinCols(row);
    rows.push(row);
  }
  return [{
    tableName: 'sequenceSummaries',
    header,
    rows
  }];
}

export default seqSummary;
