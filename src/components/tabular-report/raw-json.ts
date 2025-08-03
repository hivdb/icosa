export interface RawJSONParams {
  /** list of gene definitions included in the report */
  allGenes: any[];
  /** software version information */
  currentVersion: unknown;
  /** program version information */
  currentProgramVersion: unknown;
  /** per-sequence analysis results */
  sequenceAnalysis?: any[];
  /** per-sequence read analysis results */
  sequenceReadsAnalysis?: any[];
}

export interface RawJSONFile {
  folder: string;
  tableName: string;
  fileExt: string;
  mimeType: string;
  payload: string;
}

/**
 * Build a raw JSON representation for each analyzed sequence.
 *
 * @param params - {@link RawJSONParams} containing sequences and metadata.
 * @returns Array of {@link RawJSONFile} objects each encoding a JSON report.
 */
export default function rawJSON({
  allGenes,
  currentVersion,
  currentProgramVersion,
  sequenceAnalysis,
  sequenceReadsAnalysis
}: RawJSONParams): RawJSONFile[] {
  const jsons: RawJSONFile[] = [];
  const seqResults = (sequenceAnalysis || sequenceReadsAnalysis) as any[];
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2
    } = seqResult;
    const seqName = seqName1 || seqName2;
    jsons.push({
      folder: 'raw-json',
      tableName:
        'Raw_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      fileExt: '.json',
      mimeType: 'application/json',
      payload: JSON.stringify({
        allGenes,
        currentVersion,
        currentProgramVersion,
        report: seqResult
      }, null, 2)
    });
  }
  return jsons;
}
