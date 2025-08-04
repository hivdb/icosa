import useLocation from 'found/useLocation';

/**
 * Hook returning a list of drugs that were marked as disabled in the router
 * location state.
 *
 * @returns Array of disabled drug identifiers.
 */
export default function useDisabledDrugs(): string[] {
  const { state: { disabledDrugs = [] } = {} } = useLocation<any>();
  return disabledDrugs as string[];
}
