async function popPrevalence(dataURI) {
  const resp = await fetch(dataURI);
  const data = await resp.json();
  const pcntLookup = data.reduce((acc, row) => {
    acc[`${row.gene}${row.position}${row.aa}`] = row.percent;
    return acc;
  }, {});
  return async (colname, rows) => rows.map((row) => {
    row[colname] = (
      `${pcntLookup[`${row.gene}${row.position}${row.aminoAcid}`] * 100 ||
      .0}%`
    );
    return row;
  });
}


async function popRefAminoAcid(dataURI) {
  const resp = await fetch(dataURI);
  const data = await resp.json();
  const geneLookup = data.reduce((acc, row) => {
    acc[row.abstractGene] = row.refSequence;
    return acc;
  }, {});
  return async (colname, rows) => rows.map((row) => {
    row[colname] = geneLookup[row.gene][row.position - 1];
    return row;
  });
}


async function loadRegionPresets() {
  const url = (
    'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev/' +
    'pages/sierra-sars2/sars2-region-presets.json'
  );
  const resp = await fetch(url);
  return await resp.json();
}


export default {
  species: 'SARS2',
  graphqlURI: (
    window.__NODE_ENV === 'production' ?
      '/graphql' :
      'http://localhost:8113/Sierra-SARS2/graphql'),
  server_host: (
    window.__NODE_ENV === 'production' ?
      '' : 'http://localhost:8113'
  ),
  cmsStages: {
    'hivdb.stanford.edu': 'cms.hivdb.org/prod',
    'staging.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging',
    'staging2.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging2',
    '*': 's3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev'
  },
  mutationGenePattern: /^(RDRP|S)/i,
  seqReadsDefaultCutoff: 0.2,  // 20%
  allGenes: [
    'nsp1', 'nsp2', 'PLpro', 'nsp4', '_3CLpro', 'nsp6', 'nsp7', 'nsp8', 'nsp9',
    'nsp10', 'RdRP', 'nsp13', 'nsp14', 'nsp15', 'nsp16', 'S', 'ORF3a', 'E', 'M',
    'ORF6', 'ORF7a', 'ORF7b', 'ORF8', 'N', 'ORF10'
  ],
  highlightGenes: ['PLpro', '_3CLpro', 'RdRP', 'S'],
  geneDisplay: {
    nsp1: 'nsp1',
    nsp2: 'nsp2',
    PLpro: 'PLpro',
    nsp4: 'nsp4',
    _3CLpro: '3CLpro',
    nsp6: 'nsp6',
    nsp7: 'nsp7',
    nsp8: 'nsp8',
    nsp9: 'nsp9',
    nsp10: 'nsp10',
    RdRP: 'RdRP',
    nsp13: 'nsp13',
    nsp14: 'nsp14',
    nsp15: 'nsp15',
    nsp16: 'nsp16',
    S: 'Spike',
    ORF3a: 'ORF3a',
    E: 'E',
    M: 'M',
    ORF6: 'ORF6',
    ORF7a: 'ORF7a',
    ORF7b: 'ORF7b',
    ORF8: 'ORF8',
    N: 'N',
    ORF10: 'ORF10'
  },
  mutationTypesByGenes: {
    nsp1: {
      Other: 'Other'
    },
    nsp2: {
      Other: 'Other'
    },
    PLpro: {
      Other: 'Other'
    },
    nsp4: {
      Other: 'Other'
    },
    _3CLpro: {
      Other: 'Other'
    },
    nsp6: {
      Other: 'Other'
    },
    nsp7: {
      Other: 'Other'
    },
    nsp8: {
      Other: 'Other'
    },
    nsp9: {
      Other: 'Other'
    },
    nsp10: {
      Other: 'Other'
    },
    RdRP: {
      Other: 'Other'
    },
    nsp13: {
      Other: 'Other'
    },
    nsp14: {
      Other: 'Other'
    },
    nsp15: {
      Other: 'Other'
    },
    nsp16: {
      Other: 'Other'
    },
    S: {
      Other: 'Other'
    },
    ORF3a: {
      Other: 'Other'
    },
    E: {
      Other: 'Other'
    },
    M: {
      Other: 'Other'
    },
    ORF6: {
      Other: 'Other'
    },
    ORF7a: {
      Other: 'Other'
    },
    ORF7b: {
      Other: 'Other'
    },
    ORF8: {
      Other: 'Other'
    },
    N: {
      Other: 'Other'
    },
    ORF10: {
      Other: 'Other'
    }
  },
  maxProteinSize: 1273,  // S protein
  seqReadsDefaultStrain: 'SARS2',
  seqReadsCodonCovBgColors: {
    RdRP: '#f0f0f0',
    S: '#ffffff'
  },
  showCodonCov: true,
  showLowAbundanceMutsChart: true,
  sdrmButton: false,
  showMutationsInSummary: true,
  mutStatTableColumns: [
    {
      name: 'sarsUsualSites',
      label: '# SARS-CoV-2 >1% Mutations',
      query: 'usualSitesBy(treatment: "all", subtype: "SARS2")'
    },
    {
      name: 'sarsrUsualSites',
      label: '# Sarbecovirus ≥2 Mutations',
      query: 'usualSitesBy(treatment: "all", subtype: "SARSr")'
    },
    {
      name: 'unusualSites',
      label: '# Other Mutations',
      query: 'unusualSites',
      formatter: (count, total) => (
        `${count} (${(count / total * 100).toFixed(1)}%)`
      )
    },
    {
      name: 'dividingLine1',
      type: 'dividingLine'
    },
    {
      name: 'stopCodonSites',
      label: '# Stops',
      query: 'stopCodonSites'
    }
  ],
  codFreqExtraColumns: [
    {
      name: 'refAminoAcid',
      callback: popRefAminoAcid(
        'https://raw.githubusercontent.com/hivdb/sierra-sars2/master/src/' +
        'main/resources/genes.json'
      )
    },
    {
      name: 'covdbSARS2Pcnt',
      callback: popPrevalence(
        'https://raw.githubusercontent.com/hivdb/sierra-sars2/master/src/' +
        'main/resources/aapcnt/rx-all_taxon-SARS2.json'
      )
    },
    {
      name: 'covdbSARSPcnt',
      callback: popPrevalence(
        'https://raw.githubusercontent.com/hivdb/sierra-sars2/master/src/' +
        'main/resources/aapcnt/rx-all_taxon-SARS.json'
      )
    },
    {
      name: 'covdbSARSrPcnt',
      callback: popPrevalence(
        'https://raw.githubusercontent.com/hivdb/sierra-sars2/master/src/' +
        'main/resources/aapcnt/rx-all_taxon-SARSr.json'
      )
    }
  ],
  loadRegionPresets
};
