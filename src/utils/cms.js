import config from '../config';


export async function loadPage(pageName) {
  let stage;
  let payload;
  if (!window.__SERVER_RENDERING) {
    const {hostname} = window.location;
    stage = config.cmsStages[hostname];
    if (!stage) {
      stage = config.cmsStages['*'];
    }
    const resp = await fetch(
      `https://${stage}/pages/${pageName}.json`
    );
    if (resp.status === 403 || resp.status === 404) {
      throw new Error(`Page not found: ${pageName}`);
    }
    payload = await resp.json();
  }
  else {
    stage = config.cmsStages['hivdb.stanford.edu'];
    payload = {};
  }
  return {
    ...payload,
    imagePrefix: `https://${stage}/images/`,
    cmsPrefix: `https://${stage}/`
  };
}


export function getFullLink(path, localConfig) {
  let stage;
  if (!window.__SERVER_RENDERING) {
    const {hostname} = window.location;
    stage = localConfig.cmsStages[hostname];
    if (!stage) {
      stage = localConfig.cmsStages['*'];
    }
  }
  else {
    stage = localConfig.cmsStages['hivdb.stanford.edu'];
  }
  return `https://${stage}/${path}`;
}
