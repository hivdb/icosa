import {ungzip} from 'pako';

/**
 * Read a `File` object as text, supporting optional gzip compression.
 *
 * @param file - Browser `File` to read.
 * @returns Promise resolving with the decoded string contents.
 */
export default function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (file.type === 'application/x-gzip') {
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = new Uint8Array(reader.result as ArrayBuffer);
        const result = ungzip(arrayBuffer);
        const decoder = new TextDecoder();
        resolve(decoder.decode(result));
      };
    } else {
      reader.readAsText(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    }
  });
}

