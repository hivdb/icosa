import React from 'react';
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


function fallbackDownload(fileName, data) {
  const ts = new Date().getTime();
  fileName = fileName.replace(/(\.[^.]+$|$)/, `_${ts}$1`);
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


async function writeToFileHandle(fileHandle, data) {
  const writeFS = await fileHandle.createWritable();
  await writeFS.write(data);
  await writeFS.close();
}


function cleanFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '.');
}


function defaultState() {
  return {
    initiated: false,
    loadedFiles: [],
    dirHandle: null,
    fileHandle: null,
    zipObj: null
  };
}


export function useDownload({name, suffix, types, multiple = true}) {
  const mounted = React.useRef(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const state = React.useRef(defaultState());

  React.useEffect(
    () => {
      mounted.current = true;
      return () => mounted.current = false;
    },
    []
  );

  const onInit = React.useCallback(
    async () => {
      if (multiple && window.showDirectoryPicker) {
        const dirOpt = {startIn: 'downloads', mode: 'readwrite'};
        if (name) {
          dirOpt.id = name;
        }
        state.current.dirHandle = await window.showDirectoryPicker(dirOpt);
      }
      else if (window.showSaveFilePicker) {
        const fileOpt = {};
        if (multiple) {
          fileOpt.suggestedName = name + '.zip';
          fileOpt.types = [{
            description: 'ZIP file',
            accept: {'application/zip': ['.zip']}
          }];
          state.current.zipObj = new JSZip();
        }
        else {
          fileOpt.suggestedName = name + suffix;
          fileOpt.types = types;
        }
        fileOpt.suggestedName = cleanFileName(fileOpt.suggestedName);
        state.current.fileHandle = await window.showSaveFilePicker(fileOpt);
      }
      else if (multiple) {
        state.current.zipObj = new JSZip();
      }
      state.current.initiated = true;
      mounted.current && setIsDownloading(true);
    },
    [multiple, name, suffix, types]
  );

  const onAddFile = React.useCallback(
    async ({
      folder,
      fileName,
      data,
      isBlob = true
    }) => {
      if (!state.current.initiated) {
        await onInit();
      }
      fileName = cleanFileName(fileName);
      const {
        dirHandle,
        fileHandle,
        zipObj
      } = state.current;
      if (folder && /[/\\]$/.test(folder)) {
        throw new Error('folder must not end with slash (/) or backslash (\\)');
      }
      if (!isBlob) {
        data = utf8Encoder.encode(data);
        data = new Blob([data]);
      }
      if (dirHandle !== null) {
        // multiple files save in directory
        let dirH = dirHandle;
        if (folder) {
          for (const seg of folder.split(/[/\\]/g)) {
            dirH = await dirH.getDirectoryHandle(seg, {create: true});
          }
        }
        const fileH = await dirH.getFileHandle(fileName, {create: true});
        await writeToFileHandle(fileH, data);
      }
      else if (zipObj !== null) {
        // multiple files save in ZIP
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        zipObj.folder(name).file(filePath, data);
      }
      else if (fileHandle !== null) {
        // single file save to fileHandle
        await writeToFileHandle(fileHandle, data);
      }
      else {
        // single file download fallback
        fallbackDownload(fileName || (name + suffix), data);
      }
      state.current.loadedFiles.push(
        folder ? `${folder}/${fileName}` : fileName
      );
      mounted.current && setIsDownloading(Math.random());
    },
    [onInit, name, suffix]
  );

  const onFinish = React.useCallback(
    async () => {
      const {
        initiated,
        zipObj,
        fileHandle
      } = state.current;
      if (!initiated) {
        throw new Error(
          'onInit() and onAddFile() must be called before onFinish()'
        );
      }
      if (zipObj !== null) {
        const data = await zipObj
          .generateAsync({
            type: 'blob',
            compression: "DEFLATE",
            compressionOptions: {level: 1}
          });
        if (fileHandle !== null) {
          await writeToFileHandle(fileHandle, data);
        }
        else {
          fallbackDownload(name + '.zip', data);
        }
      }

      mounted.current && setIsDownloading(false);
      state.current = defaultState();
    },
    [name]
  );

  return {
    onInit,
    onAddFile,
    onFinish,
    loadedFiles: state.current.loadedFiles,
    isDownloading: isDownloading !== false
  };
}
