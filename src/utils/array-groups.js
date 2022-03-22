export function* consecutiveGroupsBy(array, predicate) {
  for (let i = 0; i < array.length; i ++) {
    let left = array[i];
    const group = [left];
    for (let j = i + 1; j < array.length; j ++) {
      let right = array[j];
      if (predicate(left, right)) {
        group.push(right);
        left = right;
        i ++;
      }
      else {
        break;
      }
    }
    yield group;
  }
}

export function ConsecutiveGroupsByNumber(array) {
  return consecutiveGroupsBy(array, (left, right) => left + 1 === right);
}
