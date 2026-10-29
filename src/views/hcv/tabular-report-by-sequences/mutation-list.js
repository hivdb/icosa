import {mutationGroups} from '../drm';

const header = [
  'Sequence Name',
  'Gene',
  'Position',
  'Codon',
  'RefAA',
  'MutAA',
  'Mutation',
  'Mutation Type',
  'Is Unusual',
  'Has Stop',
  'Is Ambiguous'
];

export default function mutationList({sequenceAnalysis}) {
  return sequenceAnalysis.map(({inputSequence, alignedGeneSequences}) => {
    const seqName = inputSequence.header;
    const rows = alignedGeneSequences.flatMap(({gene, mutations}) => (
      mutationGroups(gene.name, mutations).flatMap(
        ({mutationType, mutations: group}) => group.map(mut => ({
          'Sequence Name': seqName,
          'Gene': gene.name,
          'Position': mut.position,
          'Codon': mut.triplet || '---',
          'RefAA': mut.reference,
          'MutAA': mut.AAs,
          'Mutation': `${gene.name}:${mut.text}`,
          'Mutation Type': mutationType,
          'Is Unusual': mut.isUnusual ? 'Yes' : 'No',
          'Has Stop': mut.hasStop ? 'Yes' : 'No',
          'Is Ambiguous': mut.isAmbiguous ? 'Yes' : 'No'
        }))
      )
    ));
    return {
      folder: 'mutation-list',
      tableName: 'MutationList_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      header,
      rows
    };
  });
}
