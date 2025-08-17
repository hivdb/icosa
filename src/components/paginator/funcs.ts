export interface PaginatorChildItem {
  name: string;
  [key: string]: any;
}

export function getIndex(findName: string, childItems: PaginatorChildItem[]): number {
  return childItems.findIndex(({name}) => name === findName);
}
