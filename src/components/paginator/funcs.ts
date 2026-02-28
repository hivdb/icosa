import type {PaginatorChildItem} from './types';

export type {PaginatorChildItem};

export function getIndex(findName: string, childItems: PaginatorChildItem[]): number {
  return childItems.findIndex(({name}) => name === findName);
}
