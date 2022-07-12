import uniq from 'lodash/uniq';
import {create as createXML} from 'xmlbuilder2';


export default async function xmlResistance({
  allGenes,
  sequenceAnalysis,
  currentVersion,
  config
}) {
  const {geneDisplay} = config;
  const allGeneNames = allGenes.map(({name}) => name);

  const root = createXML({
    version: '1.0',
    encoding: 'UTF-8',
    standalone: 'no'
  }).ele(
    'DrugResistance_Interpretation',
    {
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:noNamespaceSchemaLocation': (
        'https://hivdb.stanford.edu/_wrapper/DR/schema/sierra.xsd'
      )
    }
  );

  root.ele('algorithmName').txt(currentVersion.family);
  root.ele('algorithmVersion').txt(currentVersion.version);
  root.ele('webServiceVersion').txt('2.0');
  root.ele('schemaVersion').txt('1.1');
  root.ele('submissionName').txt('');
  root.ele('dateTime').txt(new Date().toISOString());

  // <result>'s
  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence,
      bestMatchingSubtype,
      availableGenes,
      insertions,
      deletions,
      frameShifts,
      ambiguousMutations,
      stopCodons,
      apobecMutations,
      alignedGeneSequences: geneSeqs,
      drugResistance: geneDRs
    } = seqResult;
    const result = root.ele('result');
    const genes = availableGenes
      .filter(({name}) => allGeneNames.includes(name))
      .map(({name}) => name);

    result.ele('success').txt(genes.length > 0);

    const inputSeq = result.ele('inputSequence');
    inputSeq.ele('md5sum').txt(inputSequence.MD5);
    inputSeq.ele('name').txt(inputSequence.header);
    inputSeq.ele('sequence').txt(inputSequence.sequence);
    if (genes.length === 0) {
      result
        .ele('errorMessage')
        .txt(
          'There were no Protease, Reverse Transcriptase, or ' +
          'Integrase genes found, refuse to process (sequence ' +
          `length = ${inputSequence.sequence.length}).`
        );
    }
    result.ele('GAHypermutated').txt(apobecMutations.length > 1);

    // <geneData>'s
    for (const geneName of genes) {
      const geneDef = allGenes.find(({name}) => geneName === name);
      const geneSeq = geneSeqs.find(({gene: {name}}) => geneName === name);

      const geneDataElem = result.ele('geneData');
      geneDataElem.ele('gene').txt(geneDisplay[geneName] || geneName);
      geneDataElem.ele('present').txt(!!geneSeq);
      if (!geneSeq) {
        continue;
      }

      geneDataElem.ele('consensus').txt(geneDef.refSequence);
      geneDataElem.ele('alignedNASequence').txt(geneSeq.alignedNAs);
      geneDataElem.ele('alignedAASequence').txt(geneSeq.alignedAAs);
      geneDataElem.ele('firstAA').txt(geneSeq.firstAA);
      geneDataElem.ele('lastAA').txt(geneSeq.lastAA);

      // <subtype>
      const subtypeElem = geneDataElem.ele('subtype');
      subtypeElem.ele('type').txt(bestMatchingSubtype.display);
      subtypeElem.ele('percentSimilarity').txt(
        ((1 - bestMatchingSubtype.distance) * 100).toFixed(1)
      );

      // <mutation>'s
      for (const mut of geneSeq.mutations) {
        const mutElem = geneDataElem.ele('mutation');
        mutElem.ele('classification').txt(mut.primaryType);
        let typeText = 'mut';
        if (mut.isInsertion) {
          typeText = 'insertion';
        }
        else if (mut.isDeletion) {
          typeText = 'deletion';
        }
        mutElem.ele('type').txt(typeText);
        mutElem.ele('mutationString').txt(mut.text);
        mutElem.ele('wildType').txt(mut.reference);
        mutElem.ele('position').txt(mut.position);
        mutElem.ele('nucleicAcid').txt(mut.triplet);
        mutElem.ele('translatedNA').txt(mut.displayAAs.split('_')[0]);
        if (mut.isInsertion) {
          mutElem.ele('insertionString').txt(mut.displayAAs);
          mutElem.ele('insertionNucleicAcid').txt(mut.insertedNAs);
          mutElem
            .ele('insertionTranslatedNA')
            .txt(mut.displayAAs.split('_')[1]);
        }
        if (mut.isUnusual) {
          mutElem.ele('atypical').txt(true);
        }
        if (mut.isApobecMutation) {
          mutElem.ele('GAHypermutated').txt(true);
        }
      }

      // <quality>
      const qualityElem = geneDataElem.ele('quality');
      for (const fs of frameShifts) {
        if (fs.gene.name !== geneName) {
          continue;
        }
        const fsElem = qualityElem.ele('frameshift');
        fsElem.ele('position').txt(fs.position);
        fsElem.ele('length').txt(fs.size);
        fsElem.ele('rawAlignBlock').txt('not available');
      }
      for (const mut of ambiguousMutations) {
        if (mut.gene.name !== geneName) {
          continue;
        }
        qualityElem.ele('ambiguous').txt(mut.position);
      }
      for (const mut of stopCodons) {
        if (mut.gene.name !== geneName) {
          continue;
        }
        qualityElem.ele('stop').txt(mut.position);
      }
      for (const mut of apobecMutations) {
        if (mut.gene.name !== geneName) {
          continue;
        }
        qualityElem.ele('GAHypermutatedPositions').txt(mut.position);
      }

    }

    // <sequenceQualityCounts>
    const qcElem = result.ele('sequenceQualityCounts');
    qcElem.ele('insertions').txt(insertions.length);
    qcElem.ele('deletions').txt(deletions.length);
    qcElem.ele('ambiguous').txt(ambiguousMutations.length);
    qcElem.ele('stops').txt(stopCodons.length);
    qcElem.ele('frameshifts').txt(frameShifts.length);

    // <drugScore>'s
    for (const geneName of genes) {
      const geneDef = allGenes.find(({name}) => geneName === name);
      const geneDR = geneDRs.find(({gene: {name}}) => geneName === name);
      for (const drugClass of geneDef.drugClasses) {
        for (const drug of drugClass.drugs) {
          const dsElem = result.ele('drugScore');
          const drugScore = geneDR.drugScores
            .find(({drug: {name}}) => name === drug.name);
          dsElem.ele('drugCode').txt(drug.displayAbbr);
          dsElem.ele('genericName').txt(drug.fullName);
          dsElem.ele('type').txt(drugClass.name);
          dsElem.ele('score').txt(drugScore.score);
          dsElem.ele('resistanceLevel').txt(drugScore.level);
          dsElem.ele('resistanceLevelText').txt(drugScore.text);
          dsElem.ele('threeStepResistanceLevel').txt(drugScore.SIR);
          // <partialScore>'s
          for (const pScore of drugScore.partialScores) {
            const pScoreElem = dsElem.ele('partialScore');
            for (const mut of pScore.mutations) {
              pScoreElem.ele('mutation').txt(mut.text);
            }
            pScoreElem.ele('score').txt(pScore.score);
          }
        }
      }
    }

    // <scoreTable>'s
    for (const geneName of genes) {
      const geneDef = allGenes.find(({name}) => geneName === name);
      const geneDR = geneDRs.find(({gene: {name}}) => geneName === name);
      for (const drugClass of geneDef.drugClasses) {
        let patterns = [];
        for (const {partialScores} of geneDR.drugScores) {
          for (const {mutations} of partialScores) {
            patterns.push(mutations.map(({text}) => text).join('+'));
          }
        }
        patterns = uniq(patterns);

        const tblElem = result.ele('scoreTable');

        const headerElem = tblElem.ele('scoreRow');
        const totalElem = tblElem.ele('scoreRow');
        const patternElems = {};
        headerElem.ele('score', {value: drugClass.name});
        totalElem.ele('score', {value: 'Total:'});

        for (const pattern of patterns) {
          patternElems[pattern] = tblElem.ele('scoreRow');
          patternElems[pattern].ele('score', {value: pattern});
        }

        for (const drug of drugClass.drugs) {
          const drugScore = geneDR.drugScores
            .find(({drug: {name}}) => name === drug.name);
          headerElem.ele('score', {value: drug.displayAbbr});
          totalElem.ele('score', {
            'class': drugClass.name,
            drug: drug.displayAbbr,
            value: drugScore.score
          });
          for (const pattern of patterns) {
            const pScore = drugScore.partialScores.find(
              ({mutations}) => (
                pattern === mutations.map(({text}) => text).join('+')
              )
            );
            const score = pScore ? pScore.score : 0;
            patternElems[pattern]
              .ele('score', {
                'class': drugClass.name,
                drug: drug.displayAbbr,
                value: score
              });
          }
        }
      }
    }

    // <comment>'s
    for (const geneName of genes) {
      const geneDR = geneDRs.find(({gene: {name}}) => geneName === name);
      for (const {commentType, comments} of geneDR.commentsByTypes) {
        if (commentType === 'Dosage') {
          // XML format doesn't support Dosage
          continue;
        }
        for (const comment of comments) {
          const cmtElem = result.ele('comment');
          cmtElem.ele('gene').txt(geneName);
          cmtElem.ele('grouping').txt(commentType);
          cmtElem.ele('position').txt(comment.boundMutation.position);
          cmtElem.ele('commentString').txt(comment.text);
          cmtElem.ele('mutationString').txt(comment.boundMutation.text);
        }
      }
    }

  }

  return [{
    tableName: 'resistance',
    fileExt: '.xml',
    mimeType: 'application/xml',
    payload: root.end({prettyPrint: true})
  }];
}
