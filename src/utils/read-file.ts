import {ungzip} from 'pako';

/**
 * Read a file as text, supporting gzip compressed files.
 *
 * @param file - File object to read.
 * @returns Promise resolving to file contents as string.
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
    }
    else {
      reader.readAsText(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    }
  });
}
