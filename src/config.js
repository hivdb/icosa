import refDataLoader from './components/debug-ref-data-loader';
/* async function popPrevalence(dataURI) {
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
*/

const cmsPrefix = (
  'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev2/pages'
);


function makeCMSLoader(name) {
  return async() => {
    const resp = await fetch(
      `${cmsPrefix}/${name}.json`
    );
    return await resp.json();
  };
}


function makeMutAnnotLoader(name) {
  const cmsLoader = makeCMSLoader(name);
  return async() => {
    const {data, comments = []} = await cmsLoader();
    return {...data, comments};
  };
}


const mutAnnotViewerConfig = {
  presets: [
    {
      name: 'SARS2S',
      display: "SARS-CoV-2 Spike gene",
      annotationLoader: makeMutAnnotLoader('mutannot-spike')
    },
    {
      name: 'SARS2RdRP',
      display: "SARS-CoV-2 RNA-dependent RNA polymerase",
      annotationLoader: makeMutAnnotLoader('mutannot-rdrp')
    },
    {
      name: 'SARS23CLpro',
      display: "SARS-CoV-2 3C-like protease",
      annotationLoader: makeMutAnnotLoader('mutannot-3clpro')
    }
  ],
  refDataLoader
};


const genomeViewerConfig = {
  indexLoader: makeCMSLoader('mutation-viewer/index'),
  makePresetLoader: name => makeCMSLoader(`mutation-viewer/${name}`)
};


const config = {
  graphqlURI: (
    window.__NODE_ENV === 'production' ?
      '/graphql' :
      'http://localhost:8113/Sierra-SARS2/graphql'),
  cmsStages: {
    'hivdb.stanford.edu': 'cms.hivdb.org/prod',
    'staging.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging',
    'staging2.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging2',
    '*': 's3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev2'
  },
  mutationGenePattern: /^(RDRP|S)/i,
  seqReadsDefaultCutoff: 0.2, // 20%
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
  maxProteinSize: 1273, // S protein
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
  /* codFreqExtraColumns: [
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
  ], */
  mutAnnotViewer: mutAnnotViewerConfig,
  genomeViewer: genomeViewerConfig
};

export default config;
