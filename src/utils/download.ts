import React from 'react';
import JSZip from 'jszip';
import useMounted from './use-mounted';

declare global {
  interface Window {
    showSaveFilePicker?: (options?: any) => Promise<any>;
    showDirectoryPicker?: (options?: any) => Promise<any>;
  }

    interface Navigator {
      msSaveOrOpenBlob?: (blob: Blob, fileName: string) => void;
    }
  }

  interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
  }

  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
  }

  interface DirectoryPickerOptions {
    startIn: string;
    mode: 'read' | 'readwrite';
    id?: string;
  }

/**
 * Show a file picker dialog when supported by the browser.
 *
 * @param fileName - Suggested filename for the picker.
 * @returns A file handle or `undefined` when the API is unavailable.
 */
export async function showFilePicker(fileName: string): Promise<any | undefined> {
  if (window.showSaveFilePicker) {
    return await window.showSaveFilePicker({
      suggestedName: fileName
    });
  }
}

/**
 * Create a zip archive and trigger its download.
 *
 * @param fileName - Name of the resulting zip file.
 * @param files - Files to include within the archive.
 * @param fileHandle - Optional file handle from the picker API.
 * @returns A promise that resolves when the download is initiated.
 */
export async function makeZip(
  fileName: string,
  files: {folder?: string; fileName: string; data: Blob | string}[],
  fileHandle: any = null
): Promise<any> {
  const zip = new JSZip();
  const reports = zip.folder(fileName.replace(/\.zip$/, ''));
  if (!reports) {
    throw new Error('Unable to create zip folder');
  }
    files.forEach(({folder, fileName, data}) => {
      if (folder) {
        reports.folder(folder)?.file(fileName, data as any);
      }
      else {
        reports.file(fileName, data as any);
      }
    });
  return zip
    .generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
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

/**
 * Trigger a file download either via the File System Access API or a
 * fallback anchor element.
 *
 * @param fileName - Suggested file name.
 * @param mediaType - MIME type of the data or `null` to let the browser
 *   auto-detect the type.
 * @param data - Blob or string content to download.
 * @param isBlob - When `true`, `data` is already a `Blob` instance.
 * @param fileHandle - Optional file handle obtained from picker.
 *
 * Writes the data using the File System Access API when a handle is
 * provided, falling back to a hidden anchor element when not available.
 */
export async function makeDownload(
  fileName: string,
  mediaType: string | null,
  data: Blob | string,
  isBlob = false,
  fileHandle: any = null
): Promise<void> {
  if (typeof document === 'undefined') {
    return;
  }
  if (!fileHandle) {
    try {
      fileHandle = await showFilePicker(fileName);
    }
    catch (error: any) {
      if (error.name === 'AbortError') {
        // user aborts downloading
        return;
      }
      // else fallback to use Downloads/ folder
    }
  }
  const ts = new Date().getTime();
  fileName = fileName.replace(/(\.[^.]+$|$)/, `_${ts}$1`);
  let blob: Blob;
  if (!isBlob) {
    const encoded = utf8Encoder.encode(data as string);
    blob = new Blob([encoded], {type: mediaType || undefined});
  }
  else {
    blob = data as Blob;
  }
  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }
  else {
    const uri = URL.createObjectURL(blob);
    if (window.navigator.msSaveOrOpenBlob) {
      // download method of IE
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    }
    else {
      const a = document.createElement('a');

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

/**
 * Create an object URL and trigger a download via an anchor element.
 *
 * @param fileName - Name to assign to the downloaded file.
 * @param data - Blob representing the file contents.
 */
function fallbackDownload(fileName: string, data: Blob): void {
  const ts = new Date().getTime();
  fileName = fileName.replace(/(\.[^.]+$|$)/, `_${ts}$1`);
  const uri = URL.createObjectURL(data);
  if (window.navigator.msSaveOrOpenBlob) {
    // download method of IE
    window.navigator.msSaveOrOpenBlob(data, fileName);
  }
  else {
    const a = document.createElement('a');

    // firefox required a tag being attached to document
    a.style.display = 'none';
    document.body.appendChild(a);

    a.setAttribute('href', uri);
    a.setAttribute('download', fileName);
    a.click();
    setTimeout(() => document.body.removeChild(a));
  }
}

/**
 * Write a blob to a handle obtained from the File System Access API.
 *
 * @param fileHandle - Handle representing the destination file.
 * @param data - Blob to persist.
 */
async function writeToFileHandle(fileHandle: any, data: Blob): Promise<void> {
  const writeFS = await fileHandle.createWritable();
  await writeFS.write(data);
  await writeFS.close();
}

/**
 * Sanitize a filename by replacing characters that are invalid on most
 * filesystems.
 */
function cleanFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '.');
}

/**
 * Create the mutable state object used by {@link useDownload}.
 */
function defaultState() {
  return {
    initiated: false,
    loadedFiles: [] as string[],
    dirHandle: null as any,
    fileHandle: null as any,
    zipObj: null as any
  };
}

interface UseDownloadArgs {
  name: string;
  suffix: string;
  types: any;
  multiple?: boolean;
}

/**
 * React hook assisting in downloading one or more files, optionally through
 * the File System Access API.
 *
 * @param args - Configuration for the download behaviour.
 * @returns Helper methods and state describing the download process. The
 * `isDownloading` flag in the return value indicates whether the process is
 * currently active.
 */
export function useDownload({name, suffix, types, multiple = true}: UseDownloadArgs) {
  const isMounted = useMounted();
  const [isDownloading, setIsDownloading] = React.useState<number | boolean>(false);
  const state = React.useRef(defaultState());

  const onInit = React.useCallback(
    async () => {
      if (multiple && window.showDirectoryPicker) {
        const dirOpt: DirectoryPickerOptions = {startIn: 'downloads', mode: 'readwrite'};
        if (name) {
          dirOpt.id = name;
        }
        state.current.dirHandle = await window.showDirectoryPicker(dirOpt);
      }
      else if (window.showSaveFilePicker) {
        const fileOpt: SaveFilePickerOptions = {};
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
        if (fileOpt.suggestedName) {
          fileOpt.suggestedName = cleanFileName(fileOpt.suggestedName);
        }
        state.current.fileHandle = await window.showSaveFilePicker(fileOpt);
      }
      else if (multiple) {
        state.current.zipObj = new JSZip();
      }
      state.current.initiated = true;
      isMounted() && setIsDownloading(true);
    },
    [multiple, name, suffix, types, isMounted]
  );

  const onAddFile = React.useCallback(
    async ({
      folder,
      fileName,
      data,
      isBlob = true
    }: {folder?: string; fileName: string; data: Blob | string; isBlob?: boolean}) => {
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
      let blobData: Blob;
      if (!isBlob) {
        const encoded = utf8Encoder.encode(data as string);
        blobData = new Blob([encoded]);
      }
      else {
        blobData = data as Blob;
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
        await writeToFileHandle(fileH, blobData);
      }
      else if (zipObj !== null) {
        // multiple files save in ZIP
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        zipObj.folder(name).file(filePath, blobData);
      }
      else if (fileHandle !== null) {
        // single file save to fileHandle
        await writeToFileHandle(fileHandle, blobData);
      }
      else {
        // single file download fallback
        fallbackDownload(fileName || (name + suffix), blobData);
      }
      state.current.loadedFiles.push(
        folder ? `${folder}/${fileName}` : fileName
      );
      isMounted() && setIsDownloading(Math.random());
    },
    [onInit, name, suffix, isMounted]
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

      isMounted() && setIsDownloading(false);
      state.current = defaultState();
    },
    [name, isMounted]
  );

  return {
    onInit,
    onAddFile,
    onFinish,
    loadedFiles: state.current.loadedFiles,
    isDownloading: isDownloading !== false
  };
}
