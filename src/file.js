import humanize from 'underscore.string/humanize';


export function readFile(file) {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result);
    };
  });
}


export function writeFile(data, fileType = 'application/octet-stream', fileName = undefined) {
  if (!(data instanceof Blob)) {
    data = new Uint8Array(Array.from(data).map(c => c.charCodeAt(0)));
    data = new Blob([data], {type: fileType});
  }
  if (window.navigator.msSaveOrOpenBlob) {
    // download method of IE
    window.navigator.msSaveOrOpenBlob(data, fileName);
  }
  else {
    const uri = URL.createObjectURL(data);
    writeFileFromURI(uri, fileName);
  }
}


export function writeFileFromURI(uri, fileName = undefined) {
  const a = document.createElement('a');
  a.style.display = 'none';
  document.body.appendChild(a);

  a.setAttribute('href', uri);
  a.setAttribute('download', fileName);
  a.click();
  setTimeout(() => document.body.removeChild(a));
}
