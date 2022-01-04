import React from 'react';
import {useRouter} from 'found';


export function useLocationState(
  name,
  defaultValue,
  saveCondition = () => true
) {
  const {
    router,
    match: {
      location: {
        state = {},
        ...locRemains
      }
    }
  } = useRouter();
  let initValue = defaultValue;
  if (saveCondition() && name in state) {
    initValue = state[name];
  }
  const [value, setValue] = React.useState(initValue);

  const setValueWithLocation = React.useCallback(
    newValue => {
      if (newValue instanceof Function) {
        newValue = newValue(value);
      }
      setValue(newValue);
      if (saveCondition()) {
        state[name] = newValue;
        router.replace({...locRemains, state});
      }
    },
    [value, name, saveCondition, router, state, locRemains]
  );

  return [value, setValueWithLocation];
}


export default function createLocationState(name) {

  return (defaultValue, saveCondition) => useLocationState(
    name,
    defaultValue,
    saveCondition
  );

}
