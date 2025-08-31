import type {Mutation, Variant} from './types';


interface RowKeyOptions {
  variant?: Variant | null;
  mutations: Mutation[];
  vaccineName?: string;
}


/**
 * Build a unique key for a susceptibility row.
 *
 * @param params - Row parameters
 * @returns Unique key string
 */
export function getRowKey(row: RowKeyOptions): string {
  const {variant, mutations} = row;
  const vaccineName = 'vaccineName' in row ? row.vaccineName : null;
  const mutText = variant ?
    variant.name : mutations.map(({text}) => text).join('+');
  if (vaccineName) {
    return `${mutText}__${vaccineName}`;
  }
  return mutText;
}

/**
 * Format a fold value with appropriate rounding and limits.
 *
 * @param fold - Fold change value
 * @returns Formatted display string
 */
export function displayFold(fold: number): string {
  return fold >= 1000 ?
    '≥1,000' : `${fold.toFixed(fold > 10 ? 0 : 1)}`;
}
