import PropTypes from 'prop-types';
import {makeZip, makeDownload} from '../../../utils/download';
import {csvStringify} from '../../../utils/csv';


function useTabularReports({
  zipName = 'analysis-reports.zip',
  subOptionProcessors,
  loaded,
  config,
  subOptionIndices,
  children,
  allGenes,
  onFinish,
  ...props
}) {
  if (loaded) {
    const files = [];
    for (const idx of (subOptionIndices || children)) {
      const processor = subOptionProcessors[idx];
      for (
        const {
          folder,
          tableName,
          header,
          rows,
          payload,
          fileExt = '.csv',
          mimeType = 'text/csv',
          missing = 'NA'
        }
        of
        processor({
          allGenes,
          config,
          ...props
        })
      ) {
        let data = payload;
        if (!data) {
          const csvHeader = header.join(',');
          const csvRows = rows.map(
            row => csvStringify(row, {missing, header})
          );
          data = (
            `\ufeff${csvHeader}\n${csvRows.join('\n')}`
          );
        }
        files.push({
          folder,
          fileName: `${tableName}${fileExt}`,
          mimeType,
          data
        });
      }
    }
    if (files.length === 1) {
      const [{
        fileName,
        mimeType,
        data
      }] = files;
      makeDownload(fileName, mimeType, data);
    }
    else {
      makeZip(zipName, files);
    }
    onFinish && onFinish();
  }
  return null;
}


useTabularReports.propTypes = {
  allGenes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      refSequence: PropTypes.string.isRequired,
      length: PropTypes.number.isRequired
    })
  ),
  loaded: PropTypes.bool.isRequired,
  subOptionIndices: PropTypes.arrayOf( // old interface used by seq-report
    PropTypes.number.isRequired
  ),
  children: PropTypes.object, // new interface used by seqreads-report
  currentVersion: PropTypes.shape({
    text: PropTypes.string.isRequired,
    publishDate: PropTypes.string.isRequired
  }),
  currentProgramVersion: PropTypes.shape({
    text: PropTypes.string.isRequired,
    publishDate: PropTypes.string.isRequired
  }),
  onFinish: PropTypes.func.isRequired
};

export default useTabularReports;
