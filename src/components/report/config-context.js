import React from 'react';


export function configWrapper(config) {

  return new Proxy(config, {
    get(target, name) {
      return Object.freeze(target[name]);
    }
  });

}


export default React.createContext({});
