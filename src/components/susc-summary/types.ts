export interface Antibody {
  /** Unique antibody name */
  name: string;
  /** Optional abbreviated antibody name */
  abbrName?: string;
  /** Priority for sorting antibodies */
  priority: number;
}

export interface Reference {
  /** Reference identifier */
  refName: string;
}

export interface Mutation {
  /** Gene reference containing mutation */
  gene: { name: string };
  /** Reference sequence identifier */
  reference: string;
  /** Amino-acid position */
  position: number;
  /** Whether the position is unsequenced */
  isUnsequenced: boolean;
  /** Indicates mutation is a DRM */
  isDRM?: boolean;
  /** Amino-acid change string */
  AAs: string;
  /** Readable mutation text */
  text: string;
}

export interface Variant {
  /** Name of the variant */
  name: string;
}

/** Cumulative fold change and count */
export interface CumFold {
  /** Fold metrics */
  cumulativeFold: { median: number };
  /** Number of measurements contributing */
  cumulativeCount?: number;
}

/** Row for antibody susceptibility summary table */
export interface AbSuscSummaryRow {
  mutations: Mutation[];
  references: Reference[];
  variant?: Variant;
  displayOrder?: number | null;
  /** Fold change keyed by antibody combo */
  fold: Record<string, CumFold>;
  variantMatchingMutations?: Mutation[];
  variantExtraMutations?: Mutation[];
  variantMissingMutations?: Mutation[];
}

/** Row for vaccine plasma susceptibility summary */
export interface VpSuscSummaryRow {
  mutations: Mutation[];
  vaccineName: string;
  variant?: Variant;
  numRefs: number;
  numSamples: number;
  medianFold: number;
  references: Reference[];
  displayOrder?: number | null;
  levels: Record<string, number>;
}

/** Row for convalescent plasma susceptibility summary */
export interface CpSuscSummaryRow {
  mutations: Mutation[];
  variant?: Variant;
  numRefs: number;
  numSamples: number;
  medianFold: number;
  references: Reference[];
  displayOrder?: number | null;
  levels: Record<string, number>;
}
