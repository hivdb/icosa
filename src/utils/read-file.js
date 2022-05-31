import {ungzip} from 'pako';

export default function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (file.type === 'application/x-gzip') {
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = new Uint8Array(reader.result);
        const result = ungzip(arrayBuffer);
        const decoder = new TextDecoder();
        resolve(decoder.decode(result));
      };
    }
    else {
      reader.readAsText(file);
      reader.onload = () => {
        resolve(reader.result);
      };
    }
  });
}
