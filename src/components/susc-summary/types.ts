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
