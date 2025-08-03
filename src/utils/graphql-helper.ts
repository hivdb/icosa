import {DocumentNode} from 'graphql';

function getFirstFragmentName(
  fragment: DocumentNode,
  expectType: string | null = null
): string | undefined {
  const names: string[] = [];
  for (const {kind, name, typeCondition} of fragment.definitions as any) {
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

/**
 * Create a fragment inclusion string for GraphQL queries.
 *
 * @param fragment - Parsed fragment document.
 * @param expectType - Optional type name to match.
 * @returns Spread fragment syntax string.
 */
export function includeFragment(
  fragment: DocumentNode,
  expectType: string | null = null
): string {
  const name = getFirstFragmentName(fragment, expectType);
  return `...${name}`;
}

/**
 * Create a fragment inclusion string if the fragment matches the expected type.
 *
 * @param fragment - Parsed fragment document.
 * @param expectType - Type name to match.
 * @returns Spread fragment syntax or empty string when no match.
 */
export function includeFragmentIfExist(
  fragment: DocumentNode,
  expectType: string | null
): string {
  const name = getFirstFragmentName(fragment, expectType);
  return name ? `...${name}` : '';
}
