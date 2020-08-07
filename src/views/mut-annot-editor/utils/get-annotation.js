export default function getAnnotation(
  annotations, annotName, displayCitationIds
) {
  for (const {name, value, description = '', citationIds} of annotations) {
    if (name !== annotName) {
      continue;
    }
    if (!citationIds.some(
      citeId => displayCitationIds.includes(citeId)
    )) {
      continue;
    }
    return {
      annotVal: value,
      annotDesc: description
    };
  }
  return {
    annotVal: null,
    annotDesc: null
  };
}
