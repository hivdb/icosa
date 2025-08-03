import {makeZip, makeDownload} from '../../utils/download';
import {csvStringify} from '../../utils/csv';

export interface TabularReport {
  folder: string;
  tableName: string;
  header?: string[];
  rows?: Record<string, unknown>[];
  payload?: string;
  fileExt?: string;
  mimeType?: string;
  missing?: string;
}

export type TabularReportProcessor = (args: any) => Promise<TabularReport[]> | TabularReport[];

export interface UseTabularReportsProps {
  /** name of the zip file when multiple tables generated */
  zipName?: string;
  /** processors generating tabular report content */
  subOptionProcessors: TabularReportProcessor[];
  /** whether processing is ready */
  loaded: boolean;
  /** configuration object forwarded to processors */
  config?: Record<string, unknown>;
  /** indices or children denoting selected processor options */
  subOptionIndices?: number[];
  /** alternative field used by some callers */
  children?: number[];
  /** gene definitions */
  allGenes?: unknown[];
  /** callback invoked after processing completes */
  onFinish?: () => void;
  /** additional dynamic props forwarded to processors */
  [key: string]: unknown;
}

/**
 * Custom hook that drives the generation and download of tabular reports.
 *
 * @param props - {@link UseTabularReportsProps} configuring the report generation.
 * @returns Always `null` since this hook has side effects only.
 */
export default function useTabularReports({
  zipName = 'analysis-reports.zip',
  subOptionProcessors,
  loaded,
  config,
  subOptionIndices,
  children,
  allGenes,
  onFinish,
  ...props
}: UseTabularReportsProps): null {
  (async () => {
    if (loaded) {
      const files: { folder: string; fileName: string; mimeType: string; data: string }[] = [];
      for (const idx of (subOptionIndices || children || [])) {
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
          await processor({
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
  })();
  return null;
}
