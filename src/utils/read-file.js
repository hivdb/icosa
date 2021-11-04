import {decompress} from 'fflate';

export default function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (file.type === 'application/x-gzip') {
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = new Uint8Array(reader.result);
        decompress(arrayBuffer, {}, (err, result) => {
          if (err) {
            throw err;
          }
          const decoder = new TextDecoder();
          resolve(decoder.decode(result));
        });
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
