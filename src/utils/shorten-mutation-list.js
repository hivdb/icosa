import {consecutiveGroupsBy} from './array-groups';


export default function shortenMutationList(mutations) {
  const merged = [];
  const groups = consecutiveGroupsBy(
    mutations,
    (left, right) => {
      if (process.env.NODE_ENV !== 'production') {
        for (const field of [
          'AAs', 'reference',
          'position', 'isUnsequenced'
        ]) {
          if (!(field in left) || !(field in right)) {
            throw new Error(
              `Unabled to determine if ${JSON.stringify(left)} and ` +
              `${JSON.stringify(right)} should be merged, ` +
              `field "${field}" is not provided`
            );
          }
        }
      }
      return !left.isUnsequenced &&
      !right.isUnsequenced &&
      left.AAs === right.AAs &&
      left.AAs === '-' &&
      left.position === right.position - 1;
    }
  );
  for (const group of groups) {
    if (group.length === 1) {
      const [{text, position, ...mut}] = group;
      merged.push({
        ...mut,
        position,
        posStart: position,
        posEnd: position,
        text: text.replace('Deletion', 'Δ').replace('-', 'Δ')
      });
    }
    else {
      const leftest = group[0];
      const rightest = group[group.length - 1];
      const {position: posStart, ...mut} = leftest;
      const {position: posEnd} = rightest;
      const reference = group.map(({reference}) => reference).join('');
      merged.push({
        ...mut,
        text: `${reference}${posStart}-${posEnd}Δ`,
        reference,
        position: posStart,
        posStart,
        posEnd
      });
    }
  }
  return merged;
}
