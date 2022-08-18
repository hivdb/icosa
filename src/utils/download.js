import JSZip from 'jszip';

export async function showFilePicker(fileName) {
  if (window.showSaveFilePicker) {
    return await window.showSaveFilePicker({
      suggestedName: fileName
    });
  }
}

export async function makeZip(fileName, files, fileHandle = null) {
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
    .then(data => makeDownload(
      fileName,
      'application/zip',
      data,
      true,
      fileHandle
    ));
}

const utf8Encoder = new TextEncoder();

export async function makeDownload(
  fileName,
  mediaType,
  data,
  isBlob = false,
  fileHandle = null
) {
  if (typeof(document) === 'undefined') {
    return;
  }
  if (!fileHandle) {
    try {
      fileHandle = await showFilePicker(fileName);
    }
    catch (error) {
      if (error.name === 'AbortError') {
        // user aborts downloading
        return;
      }
      // else fallback to use Downloads/ folder
    }
  }
  const ts = new Date().getTime();
  fileName = fileName.replace(/(\.[^.]+$|$)/, `_${ts}$1`);
  if (!isBlob) {
    data = utf8Encoder.encode(data);
    data = new Blob([data], {type: mediaType});
  }
  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
  else {
    let uri = URL.createObjectURL(data);
    if (window.navigator.msSaveOrOpenBlob) {
      // download method of IE
      window.navigator.msSaveOrOpenBlob(data, fileName);
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
}
