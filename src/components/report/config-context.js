import createAsyncContext from '../../utils/async-context';


export async function configWrapper(config) {

  if (config.configFromURL) {
    const resp = await fetch(config.configFromURL);
    const asyncConfig = await resp.json();
    config = {
      ...config,
      ...asyncConfig
    };
  }

  return new Proxy(config, {
    get(target, name) {
      return Object.freeze(target[name]);
    }
  });

}


export default createAsyncContext();
