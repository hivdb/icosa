/**
 * Utilities for loading example input data for the SARS2 forms.
 */
import {getFullLink} from '../../../utils/cms';

export function loadExampleCodonReads(examples: string[], config: any): string[] {
  return examples.map(url => getFullLink(url, config));
}

export function loadExampleFasta(
  examples: Array<{url: string; title: string}>,
  config: any
): Array<{url: string; title: string}> {
  return examples.map(({url, title}) => ({
    url: getFullLink(url, config),
    title
  }));
}
