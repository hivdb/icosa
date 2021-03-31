import React from 'react';
import {useRouter} from 'found';


export default function useLocationState(
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
  
  const setValueWithLocation = newValue => {
    if (newValue instanceof Function) {
      newValue = newValue(value);
    }
    setValue(newValue);
    if (saveCondition()) {
      state[name] = newValue;
      router.replace({...locRemains, state});
    }
  };

  return [value, setValueWithLocation];
}
