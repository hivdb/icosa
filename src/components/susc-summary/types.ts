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
  cumulativeCount: number;
}

/**
 * Base item for susceptibility summary tables
 */
export interface SuscSummary {
  mutations: Mutation[];
  references: Reference[];
  variant?: Variant | null;
  variantMatchingMutations?: Mutation[];
  variantExtraMutations?: Mutation[];
  variantMissingMutations?: Mutation[];
  displayOrder?: number | null;
}

export interface AbSummaryByAntibodyEntry extends CumFold {
  antibodies: Antibody[];
}

export interface ItemsByResistLevelEntry extends CumFold {
  resistanceLevel: string;
}

export interface VpSummaryByVaccineEntry extends CumFold {
  vaccineName: string;
  references: Reference[];
  itemsByResistLevel: ItemsByResistLevelEntry[];
}


export interface AbSuscSummaryInput extends SuscSummary {
  itemsByAntibody: AbSummaryByAntibodyEntry[];
}

/** Row for antibody susceptibility summary table */
export interface AbSuscSummaryRow extends SuscSummary {
  /** Fold change keyed by antibody combo */
  fold: Record<string, CumFold>;
}

export interface VpSuscSummaryInput extends SuscSummary {
  itemsByVaccine: VpSummaryByVaccineEntry[];
}

/** Row for vaccine plasma susceptibility summary */
export interface VpSuscSummaryRow extends SuscSummary {
  vaccineName: string;
  numRefs: number;
  numSamples: number;
  medianFold: number;
  levels: Record<string, number>;
}

export interface CpSuscSummaryInput extends SuscSummary {
  variant?: Variant;
  mutations: Mutation[];
  references: Reference[];
  cumulativeCount: number;
  cumulativeFold: {median: number};
  itemsByResistLevel: ItemsByResistLevelEntry[];
  displayOrder?: number | null;
}

/** Row for convalescent plasma susceptibility summary */
export interface CpSuscSummaryRow extends SuscSummary {
  numRefs: number;
  numSamples: number;
  medianFold: number;
  levels: Record<string, number>;
}
