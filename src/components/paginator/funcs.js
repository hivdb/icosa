export function getIndex(findName, childItems) {
  return childItems.findIndex(({name}) => name === findName);
}
