function getFirstFragmentName(fragment, expectType = null) {
  const names = [];
  for (const {kind, name, typeCondition} of fragment.definitions) {
    if (kind !== 'FragmentDefinition') {
      throw new Error(
        'Unsupport query is supplied to `getFragmentNames`: ' +
        `received \`${kind}\` but only \`FragmentDefinition\` is allowd.`
      );
    }
    if (typeCondition && typeCondition.name &&
        (expectType === null || typeCondition.name.value === expectType)) {
      names.push(name.value);
    }
  }
  return names[0];
}


export function includeFragment(fragment, expectType = null) {
  const name = getFirstFragmentName(fragment, expectType);
  return `...${name}`;
}

export function includeFragmentIfExist(fragment, expectType) {
  const name = getFirstFragmentName(fragment, expectType);
  return name ? `...${name}` : '';
}
