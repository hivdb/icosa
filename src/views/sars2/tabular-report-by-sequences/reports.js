import React from 'react';
import PropTypes from 'prop-types';

import {makeZip, makeDownload} from '../../../utils/download';
import {csvStringify} from '../../../utils/csv';

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
      config,
      // currentVersion,
      // currentProgramVersion,
      subOptionIndices,
      allGenes,
      sequenceAnalysis,
      onFinish,
      ...props
    } = this.props;
    if (loaded) {
      const files = [];
      for (const idx of subOptionIndices) {
        const processor = subOptionProcessors[idx];
        for (
          const {
            folder,
            tableName,
            header,
            rows,
            missing = 'NA'
          }
          of
          processor({
            allGenes,
            sequenceAnalysis,
            config,
            ...props
          })
        ) {
          const csvHeader = header.join(',');
          const csvRows = rows.map(
            row => csvStringify(row, {missing, header})
          );
          const csvText = (
            `${csvHeader}\n${csvRows.join('\n')}`
          );
          files.push({
            folder,
            fileName: `${tableName}.csv`,
            data: `\ufeff${csvText}`
          });
        }
      }
      if (files.length === 1) {
        const [{
          fileName,
          data
        }] = files;
        makeDownload(fileName, 'text/csv', data);
      }
      else {
        makeZip('analysis-reports.zip', files);
      }
      onFinish();
    }
    return null;
  }
}
