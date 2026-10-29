import geneReferences from './gene-references.json';

const polyproteinGenes = [
  'CORE',
  'E1',
  'E2',
  'P7',
  'NS2',
  'NS3',
  'NS4A',
  'NS4B',
  'NS5A_NTD',
  'NS5A_CTD',
  'NS5B'
];

const allGenes = [
  'NS3',
  'NS5A_NTD',
  'NS5B'
];
const highlightGenes = allGenes;

const regionColors = {
  NS3: {fill: '#b2df8a', color: '#33a02c'},
  NS5A_NTD: {fill: '#a6cee3', color: '#1f78b4'},
  NS5B: {fill: '#cab2d6', color: '#6a3d9a'}
};

// E2 and NS5A_CTD lengths vary across the Sierra HCV strain references.
const variableGeneLengths = {
  HCV1: {E2: 363, NS5A_CTD: 235},
  HCV2: {E2: 367, NS5A_CTD: 253},
  HCV3: {E2: 369, NS5A_CTD: 239},
  HCV4: {E2: 363, NS5A_CTD: 232},
  HCV5: {E2: 364, NS5A_CTD: 237},
  HCV6: {E2: 368, NS5A_CTD: 238},
  HCV7: {E2: 367, NS5A_CTD: 233},
  HCV8: {E2: 367, NS5A_CTD: 236}
};

const strains = Object.keys(variableGeneLengths);
const rangesByStrain = Object.fromEntries(strains.map(strain => {
  let posStart = 1;
  const ranges = Object.fromEntries(polyproteinGenes.map(gene => {
    const length = variableGeneLengths[strain][gene] ||
      geneReferences[gene].length;
    const posEnd = posStart + length * 3 - 1;
    const range = [posStart, posEnd];
    posStart = posEnd + 1;
    return [gene, range];
  }));
  return [strain, ranges];
}));

const genes = allGenes.map(gene => ({
  gene,
  displayGene: gene,
  rangeByStrain: Object.fromEntries(strains.map(strain => (
    [strain, rangesByStrain[strain][gene]]
  )))
}));

export {allGenes, highlightGenes};

const regionPresets = {
  presets: strains.flatMap(strain => allGenes.map(gene => ({
    name: gene,
    label: gene,
    strainOnly: [strain],
    highlightGenes: [gene],
    preset: {
      width: 1720,
      minHeight: 170,
      paddingLeft: 60,
      paddingRight: 20,
      paddingTop: 20,
      positionExtendSize: 30,
      positionAxis: {
        posOffset: rangesByStrain[strain][gene][0] - 1,
        posStart: rangesByStrain[strain][gene][0],
        posEnd: rangesByStrain[strain][gene][1],
        convertToAA: true,
        tickCount: 15,
        roundToNearest: 5
      },
      domains: [{
        posStart: rangesByStrain[strain][gene][0],
        posEnd: rangesByStrain[strain][gene][1],
        scaleRatio: 1
      }],
      regions: [{
        name: gene,
        label: gene,
        posStart: rangesByStrain[strain][gene][0],
        posEnd: rangesByStrain[strain][gene][1],
        ...regionColors[gene],
        shapeType: 'rect',
        labelPosition: 'over'
      }]
    }
  }))),
  genes
};

export default regionPresets;
