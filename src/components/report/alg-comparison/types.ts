/**
 * Type definitions for alg-comparison component.
 */

/**
 * Properties for {@link AlgComparison} component.
 */
export interface AlgComparisonProps {
  /**
   * Array of algorithm comparison entries grouped by drug class.
   */
  algorithmComparison: AlgorithmComparisonEntry[];
}

/**
 * Represents a single algorithm comparison entry for a drug class.
 */
export interface AlgorithmComparisonEntry {
  /**
   * The drug class being compared.
   */
  drugClass: DrugClass;
  /**
   * Scores for each drug in this class across algorithms.
   */
  drugScores: DrugScore[];
}

/**
 * Properties for {@link AlgDrugClassComparison} component.
 */
export interface AlgDrugClassComparisonProps {
  /**
   * List of scores for each drug and algorithm.
   */
  drugScores: DrugScore[];
}

/**
 * Represents a drug class.
 */
export interface DrugClass {
  name: string;
}

/**
 * Represents a drug.
 */
export interface Drug {
  name: string;
  displayAbbr: string;
}

/**
 * Represents a drug score for an algorithm.
 */
export interface DrugScore {
  drug: Drug;
  algorithm: string;
  SIR: string;
  interpretation: string;
  explanation: string;
}
