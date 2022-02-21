import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';


export function getRowKey({variant, mutations, vaccineName}) {
  const mutText = variant ?
    variant.name : mutations.map(({text}) => text).join('+');
  if (vaccineName) {
    return `${mutText}__${vaccineName}`;
  }
  else {
    return mutText;
  }
}


export function displayFold(fold) {
  return fold >= 1000 ?
    '≥1,000' : `${fold.toFixed(fold > 10 ? 0 : 1)}`;
}
