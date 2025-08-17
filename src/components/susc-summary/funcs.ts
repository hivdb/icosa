import type {Mutation, Variant} from './types';

/**
 * Build a unique key for a susceptibility row.
 *
 * @param params - Row parameters
 * @returns Unique key string
 */
export function getRowKey({variant, mutations, vaccineName}: {variant?: Variant; mutations: Mutation[]; vaccineName?: string;}) {
  const mutText = variant ?
    variant.name : mutations.map(({text}) => text).join('+');
  if (vaccineName) {
    return `${mutText}__${vaccineName}`;
  }
  else {
    return mutText;
  }
}

/**
 * Format a fold value with appropriate rounding and limits.
 *
 * @param fold - Fold change value
 * @returns Formatted display string
 */
export function displayFold(fold: number) {
  return fold >= 1000 ?
    '≥1,000' : `${fold.toFixed(fold > 10 ? 0 : 1)}`;
}

