export interface GeneItem {
  strain: { name: string };
  name: string;
  length: number;
}

export interface CodonReadsCoverageItem {
  gene: { name: string };
  position: number;
  totalReads: number;
  isTrimmed: boolean;
}

export type Genes = GeneItem[];
export type CodonReadsCoverage = CodonReadsCoverageItem[];
