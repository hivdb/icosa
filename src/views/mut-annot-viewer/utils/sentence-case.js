import upperFirst from 'lodash/upperFirst';

export default function sentenceCase(text) {
  return upperFirst(text);
}
