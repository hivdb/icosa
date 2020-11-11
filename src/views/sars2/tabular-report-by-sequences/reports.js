import React from 'react';
import PropTypes from 'prop-types';

import {makeZip} from '../../../utils/download';
import {tsvStringify} from '../../../utils/csv';
import ConfigContext from '../../../components/report/config-context';

import {subOptionProcessors} from './sub-options';


export default class SequenceTabularReports extends React.Component {

  static propTypes = {
    allGenes: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        refSequence: PropTypes.string.isRequired,
        length: PropTypes.number.isRequired
      })
    ),
    species: PropTypes.string.isRequired,
    loaded: PropTypes.bool.isRequired,
    subOptionIndices: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    sequences: PropTypes.array.isRequired,
    currentVersion: PropTypes.shape({
      text: PropTypes.string.isRequired,
      publishDate: PropTypes.string.isRequired
    }),
    currentProgramVersion: PropTypes.shape({
      text: PropTypes.string.isRequired,
      publishDate: PropTypes.string.isRequired
    }),
    sequenceAnalysis: PropTypes.array.isRequired,
    onFinish: PropTypes.func.isRequired
  }

  render() {
    const {
      loaded,
      // currentVersion,
      // currentProgramVersion,
      subOptionIndices,
      allGenes,
      sequenceAnalysis,
      onFinish
    } = this.props;
    return <ConfigContext.Consumer>
      {config => {
        if (loaded) {
          const files = [];
          for (const idx of subOptionIndices) {
            const processor = subOptionProcessors[idx];
            for (const {
              tableName,
              header,
              rows,
              missing = 'NA'
            } of processor({
              allGenes,
              sequenceAnalysis,
              config
            })) {
              const tsvHeader = header.join('\t');
              const tsvRows = rows.map(
                row => tsvStringify(row, {missing, header})
              );
              const tsvText = (
                `${tsvHeader}\n${tsvRows.join('\n')}`
              );
              files.push({
                fileName: `${tableName}.tsv`,
                data: tsvText
              });
            }
          }
          makeZip('analysis-reports.zip', files);
          onFinish();
        }
        return null;
      }}
    </ConfigContext.Consumer>;
  }
}
