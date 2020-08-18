export function editDefaultExtraAnnots({actionObj}) {
  const {
    extraAnnots
  } = actionObj;
  return {
    defaultExtraAnnots: extraAnnots.map(({name}) => name)
  };
}
