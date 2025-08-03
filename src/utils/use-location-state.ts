import React from 'react';
import {useRouter} from 'found';

/**
 * Persist a state value in the router location state, allowing
 * the value to survive navigation.
 *
 * @param name - Key used to store the state in the location object.
 * @param defaultValue - Initial value when no state is present.
 * @param saveCondition - Optional predicate controlling whether the value
 *                        should be saved back to the location. Defaults to
 *                        always saving.
 * @returns Tuple of the current value and a setter mirroring `useState`.
 */
export function useLocationState<T>(
  name: string,
  defaultValue: T,
  saveCondition: () => boolean = () => true
): [T, (newValue: React.SetStateAction<T>) => void] {
  const {
    router,
    match: {
      location: {
        state = {},
        ...locRemains
      }
    }
  } = useRouter<any>();

  let initValue = defaultValue;
  if (saveCondition() && name in state) {
    initValue = (state as Record<string, T>)[name];
  }
  const [value, setValue] = React.useState<T>(initValue);

  const setValueWithLocation = React.useCallback(
    (newValue: React.SetStateAction<T>) => {
      if (newValue instanceof Function) {
        newValue = newValue(value);
      }
      setValue(newValue as T);
      if (saveCondition()) {
        (state as Record<string, T>)[name] = newValue as T;
        router.replace({...locRemains, state});
      }
    },
    [value, name, saveCondition, router, state, locRemains]
  );

  return [value, setValueWithLocation];
}

/**
 * Create a customized hook bound to a fixed location state key.
 *
 * @param name - Location state key.
 * @returns A hook accepting default value and optional save condition.
 */
export default function createLocationState<T>(name: string) {
  return (
    defaultValue: T,
    saveCondition?: () => boolean
  ) => useLocationState<T>(name, defaultValue, saveCondition);
}
