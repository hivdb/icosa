/**
 * Look up an annotation by name from an array of annotations.
 *
 * @param annotations - List of annotation objects containing at least `name`,
 *   optional `value`, and optional `description` fields.
 * @param annotName - Name of the annotation to search for.
 * @returns An object with the annotation value and description, or `null`
 *   values if no matching annotation is found.
 */
export default function getAnnotation(
  annotations: Array<{name: string; value?: string; description?: string}>,
  annotName: string
): {annotVal: string | null; annotDesc: string | null} {
  for (const {name, value, description = ''} of annotations) {
    if (name !== annotName) {
      continue;
    }
    return {
      annotVal: value ?? null,
      annotDesc: description
    };
  }
  return {
    annotVal: null,
    annotDesc: null
  };
}
