import JSZip from 'jszip';

export function makeZip(fileName, files) {
  let zip = new JSZip();
  let reports = zip.folder(fileName.replace(/\.zip$/, ''));
  files.forEach(({folder, fileName, data}) => {
    if (folder) {
      reports.folder(folder).file(fileName, data);
    }
    else {
      reports.file(fileName, data);
    }
  });
  return zip
    .generateAsync({
      type: 'blob',
      compression: "DEFLATE",
      compressionOptions: {level: 1}
    })
    .then(data => makeDownload(fileName, 'application/zip', data, true));
}

const utf8Encoder = new TextEncoder();

export function makeDownload(fileName, mediaType, data, isBlob = false) {
  if (typeof(document) === 'undefined') {
    return;
  }
  const ts = new Date().getTime();
  fileName = fileName.replace(/(\.[^.]+$|$)/, `_${ts}$1`);
  if (!isBlob) {
    data = utf8Encoder.encode(data);
    data = new Blob([data], {type: mediaType});
  }
  let uri = URL.createObjectURL(data);
  if (window.navigator.msSaveOrOpenBlob) {
    // download method of IE
    window.navigator.msSaveOrOpenBlob(data, fileName);
  }
  else if (fileName.endsWith('.xml') && data.size < 1024 * 1024) {
    // open small XML in browser instead of downloading it
    window.location = uri;
  }
  else {
    let a = document.createElement('a');

    // firefox required a tag being attached to document
    a.style.display = 'none';
    document.body.appendChild(a);

    a.setAttribute('href', uri);
    a.setAttribute('download', fileName);
    a.click();
    setTimeout(() => document.body.removeChild(a));
  }
}
