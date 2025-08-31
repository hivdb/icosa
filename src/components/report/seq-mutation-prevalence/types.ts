import type {RowRecord} from '../../simple-table/types';

export interface SubtypeStat {
  name: string;
  stats: {
    gene: {name: string};
    totalNaive: number;
    totalTreated: number;
  }[];
}

export interface SubtypeForAA {
  AA: string;
  subtypes: {
    subtype: {name: string};
    percentageNaive: number;
    percentageTreated: number;
  }[];
}

export interface PrevalenceEntry {
  boundMutation: {
    gene: {name: string};
    position: number;
    reference: string;
    text: string;
    triplet: string;
  };
  matched: SubtypeForAA[];
  others: SubtypeForAA[];
}

export interface FlatPrevalenceEntry extends RowRecord {
  mutation: string;
  triplet: string;
  [key: `naive${string}` | `treated${string}`]: [string, number][];
}

export interface PrevalenceRow extends FlatPrevalenceEntry {
  rowId?: number;
  parentRowId?: number;
  children?: PrevalenceRow[];
  showChildren?: boolean;
}
