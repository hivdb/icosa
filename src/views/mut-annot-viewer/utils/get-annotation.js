export default function getAnnotation(annotations, annotName) {
  for (const {name, value, description = ''} of annotations) {
    if (name !== annotName) {
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
