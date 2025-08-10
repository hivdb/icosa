import axios, {type AxiosResponse} from 'axios';
import sleep from 'sleep-promise';

import {makeDownload} from './download';

const API_SERVER = 'https://codfreq-api.hivdb.org';

/**
 * Shape of the server response when a new task is created.
 */
interface CreateTaskResponse {
  taskKey: string;
  lastUpdatedAt: string;
  status: string;
}

/**
 * Metadata returned for uploading a file directly to the server.
 */
interface PresignedPost {
  url: string;
  fields: Record<string, string>;
}

/**
 * Representation of a FASTQ file pair.
 */
interface FilePair {
  name: string;
  pair: (File | null)[];
  n: number;
}

/**
 * Tuple used internally to track upload progress.
 */
type UploadProgressTuple = [number, Promise<UploadProgressTuple> | null];

/**
 * A batch of log events emitted by the runner.
 */
interface RunnerLogEntry {
  ecsTaskId: string;
  events: {timestamp: number; [key: string]: any}[];
}

interface RunnerLogsResponse {
  status: string;
  taskEvents: RunnerLogEntry[];
}

/**
 * Normalize server errors to a standard {@link Error} instance.
 *
 * @param e - Axios error object thrown by the request.
 * @throws Error wrapping the server response.
 */
function handleResponseError(e: any): never {
  if (!e.response || !e.response.data) {
    throw e;
  }
  const {error} = e.response.data;
  throw new Error(`Server rejected our request: ${error}`);
}

/**
 * Create a new asynchronous processing task on the server.
 *
 * @param options - Task configuration to send to the server.
 * @returns The task key and initial metadata.
 */
async function createTask(options: unknown): Promise<CreateTaskResponse> {
  let resp: AxiosResponse<CreateTaskResponse> | undefined;
  try {
    resp = await axios.post<CreateTaskResponse>(`${API_SERVER}/create-task`, {
      options
    });
  } catch (e) {
    handleResponseError(e);
  }
  if (!resp) {
    throw new Error('No response received from create-task endpoint');
  }
  const {taskKey, lastUpdatedAt, status} = resp.data;
  return {taskKey, lastUpdatedAt, status};
}


/**
 * Upload a single file to the server while yielding progress updates.
 *
 * @param file - File object to upload.
 * @param url - Presigned POST URL.
 * @param fields - Form fields required by the presigned POST.
 * @yields Progress information for the upload.
 */
async function* uploadFile(
  file: File,
  url: string,
  fields: Record<string, string>
): AsyncGenerator<{step: string; description: string; count: number; total: number}> {
  const formData = new FormData();
  for (const name in fields) {
    formData.append(name, fields[name]);
  }
  formData.append('file', file);
  const fileSize = file.size;
  let progress: Promise<UploadProgressTuple> | null = new Promise(resolve => axios
    .post(url, formData, {
      onUploadProgress: evt => {
        let nextProgress: Promise<UploadProgressTuple>;
        nextProgress = new Promise<UploadProgressTuple>(nextResolve => {
          if (evt.loaded >= fileSize) {
            return;
          }
          setTimeout(() => {
            resolve([
              evt.loaded,
              nextProgress
            ]);
            resolve = nextResolve;
          }, 0);
        });
      }
    })
    .then(() => resolve([fileSize, null]))
    .catch((e) => handleResponseError(e)));
  let prevCount = 0;
    while (progress !== null) {
      const [count, nextProgress]: UploadProgressTuple = await progress;
      progress = nextProgress;
    if (count < fileSize && count > prevCount) {
      yield {
        step: `upload:${file.name}`,
        description: `Uploading ${file.name}...`,
        count,
        total: fileSize
      };
      prevCount = count;
    }
  }
  yield {
    step: `upload:${file.name}`,
    description: `Uploaded ${file.name}`,
    count: fileSize,
    total: fileSize
  };
}


/**
 * Upload all FASTQ files for the task, yielding progress events for each.
 *
 * @param taskKey - Identifier of the server-side task.
 * @param filePairs - Collection of FASTQ file pairs to upload.
 */
async function* uploadFiles(
  taskKey: string,
  filePairs: FilePair[]
): AsyncGenerator<{step: string; description: string; count: number; total: number}> {
  const files = filePairs.reduce<File[]>(
    (acc, {pair}) => [
      ...acc,
      ...pair.filter((f): f is File => Boolean(f))
    ],
    []
  );
  const fileNames = files.map(({name}) => name);
  let resp: AxiosResponse<{presignedPosts: PresignedPost[]}> | undefined;
  try {
    resp = await axios.post<{presignedPosts: PresignedPost[]}>(
      `${API_SERVER}/direct-upload`,
      {taskKey, fileNames}
    );
  } catch (e) {
    handleResponseError(e);
  }
  if (!resp) {
    throw new Error('No response received from direct-upload endpoint');
  }
  const {presignedPosts} = resp.data;
  yield {
    step: 'upload-credential',
    description: 'Retriving uploading credential...',
    count: 1,
    total: 1
  };
  for (let i = 0; i < files.length; i ++) {
    const file = files[i];
    const {url, fields} = presignedPosts[i];
    for await (const progress of uploadFile(file, url, fields)) {
      yield progress;
    }
  }
}


/**
 * Ask the server to start processing the uploaded files.
 *
 * @param taskKey - Task identifier returned by {@link createTask}.
 * @param filePairs - Files that have been uploaded for the task.
 * @param runners - Runner configuration object passed through to the API.
 */
async function triggerRunner(
  taskKey: string,
  filePairs: FilePair[],
  runners: unknown
): Promise<void> {
  const pairInfo = filePairs.map(
    ({name, pair, n}) => ({
      name,
      pair: pair.map(f => (f ? f.name : null)),
      n
    })
  );

  try {
    await axios.post(
      `${API_SERVER}/trigger-runner`,
      {
        taskKey,
        runners, //: [{
        //  profile: 'SARS2.json'
        //}],
        pairInfo
      }
    );
  } catch (e) {
    handleResponseError(e);
  }
}


/**
 * Stream progress events emitted by the server while processing files.
 *
 * @param taskKey - Identifier of the task whose progress is being tracked.
 */
async function* fetchRunnerProgress(taskKey: string) {
  let prevCounts: Record<string, number> = {};
  for await (const event of fetchRunnerLogs(taskKey) as AsyncGenerator<any>) {
    const {op, numTasks, ecsTaskId} = event;
    switch (op) {
      case 'preprocess': {
        const {status, query} = event as any;
        let qname = query.split('/');
        qname = qname[qname.length - 1];
        yield {
          step: `preprocess-${ecsTaskId}-${qname}`,
          description: `Pre-processing ${qname} using fastp...`,
          count: status === 'working' ? 0 : 1,
          total: 1
        };
        break;
      }
      case 'trim': {
        const {status, command, query} = event as any;
        let qname = query.split('/');
        qname = qname[qname.length - 1];
        yield {
          step: `trim-${ecsTaskId}-${qname}`,
          description: `Trimming primer(s) of ${qname} using ${command}...`,
          count: status === 'working' ? 0 : 1,
          total: 1
        };
        break;
      }
      case 'alignment': {
        const {status, query, target} = event as any;
        let qname = query.split('/');
        qname = qname[qname.length - 1];
        yield {
          step: `align-${ecsTaskId}-${qname}`,
          description: (
            `Aligning ${qname} with ${target} using Minimap2, ` +
            'this may take 1-2 minutes...'
          ),
          count: status === 'working' ? 0 : 1,
          total: 1
        };
        break;
      }
      case 'progress': {
        const {count, total, fastqs} = event as any;
        const fnames = fastqs
          .filter((fn): fn is string => Boolean(fn))
          .map((fn: string) => {
            const parts = fn.split('/');
            return parts[parts.length - 1];
          });
        const fnamesText = fnames.join(', ');
        if (count > (prevCounts[fnamesText] || 0)) {
          yield {
            step: `process-${ecsTaskId}-${fnamesText}`,
            description: `Processing file(s) ${fnamesText}...`,
            numParallels: numTasks,
            parallelTaskId: ecsTaskId,
            count,
            total
          };
          prevCounts[fnamesText] = count;
        }
        break;
      }
      default:
        continue;
    }
  }
}


/**
 * Fetch log events from the server, yielding them as they arrive.
 *
 * @param taskKey - Identifier of the task.
 */
async function* fetchRunnerLogs(taskKey: string): AsyncGenerator<{ecsTaskId: string; numTasks: number; [key: string]: any}> {
  let startTime: number[] | undefined;
  while (true) {
    let resp: AxiosResponse<RunnerLogsResponse> | undefined;
    try {
      resp = await axios.post<RunnerLogsResponse>(`${API_SERVER}/fetch-runner-logs`, {
        taskKey,
        ...(startTime ? {startTime: startTime.join(',')} : {})
      });
    } catch (e) {
      handleResponseError(e);
    }
    if (!resp) {
      throw new Error('No response received from fetch-runner-logs endpoint');
    }
    const {status, taskEvents} = resp.data;
    const numTasks = taskEvents.length;
    const newStartTime: number[] = [];
    for (let i = 0; i < numTasks; i ++) {
      const curStartTs: number = startTime ? startTime[i] : 1;
      const {ecsTaskId, events}: RunnerLogEntry = taskEvents[i];
      for (const event of events) {
        if (event.timestamp < curStartTs) {
          continue;
        }
        yield {
          ecsTaskId,
          numTasks,
          ...event
        };
      }
      newStartTime.push(Math.max(
        curStartTs,
        events.length > 0 ?
          events[events.length - 1].timestamp + 1 : 1
      ));
    }
    if (status === 'success') {
      break;
    }
    startTime = newStartTime;
    await sleep(5000);
  }
}


/**
 * Download all files associated with a task and forward them to callbacks.
 *
 * @param taskKey - Identifier of the task to download files from.
 * @param handlers - Callback hooks for each file and completion.
 */
export async function saveAllFiles(
  taskKey: string,
  {onAddFile, onFinish}: {
    onAddFile: (args: {fileName: string; data: Blob; isBlob: boolean}) => Promise<void> | void;
    onFinish: () => void;
  }
): Promise<void> {
  let resp: Response | undefined;
  let nextToken: string | undefined;
  let isTruncated: boolean | undefined;
  do {
    try {
      resp = await fetch(`${API_SERVER}/fetch-allfiles`, {
        method: 'POST',
        body: JSON.stringify({
          taskKey,
          nextToken
        })
      });
    } catch (e) {
      handleResponseError(e);
    }
    if (!resp) {
      throw new Error('No response received from fetch-allfiles endpoint');
    }
    const payload: {
      isTruncated: boolean;
      nextToken?: string;
      files: {fileName: string; url: string}[];
    } = await resp.json();
    isTruncated = payload.isTruncated;
    nextToken = payload.nextToken;
    for (const {fileName, url} of payload.files) {
      const fileResp = await fetch(url);
      await onAddFile({
        fileName,
        data: await fileResp.blob(),
        isBlob: true
      });
    }
  } while (isTruncated);

  onFinish();
}

/**
 * Trigger download of codfreq results as a ZIP archive.
 *
 * @param taskKey - Identifier of the task whose results to download.
 */
export async function downloadCodfreqs(taskKey: string): Promise<void> {
  let resp: Response | undefined;
  try {
    resp = await fetch(`${API_SERVER}/fetch-codfreqs-zip`, {
      method: 'POST',
      body: JSON.stringify({
        taskKey
      })
    });
  } catch (e) {
    handleResponseError(e);
  }
  if (resp) {
    makeDownload(
      'codfreqs.zip',
      'application/zip',
      await resp.blob(),
      true
    );
  }
}


async function fetchCodfreqs(taskKey: string) {
  let resp: Response | undefined;
  try {
    resp = await fetch(`${API_SERVER}/fetch-codfreqs`, {
      method: 'POST',
      body: JSON.stringify({
        taskKey
      })
    });
  } catch (e) {
    handleResponseError(e);
  }
  if (!resp || !resp.body) {
    throw new Error('Invalid codfreqs response');
  }
  const beginMarker = '"codfreqs": [';
  const sepMarker = ', ';
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  const codfreqs = [];
  let buffer = '';
  let begin = false;
  let allDone = false;
  let numBraces = 0;
  let unprocessedText = '';

  // The response from fetch-codfreqs can be very huge,
  // following is a hack way to extract each codfreq and
  // parse them separatedly.
  do {
    const {done, value} = await reader.read();
    let text = unprocessedText + decoder.decode(value);
    if (begin) {
      unprocessedText = '';
    }
    else {
      const idx = text.indexOf(beginMarker);
      if (idx < 0) {
        unprocessedText = text;
        continue;
      }
      text = text.slice(idx + beginMarker.length);
      begin = true;
    }
    let offset = 0;
    do {
      let openIdx = text.indexOf('{', offset);
      let closeIdx = text.indexOf('}', offset);
      openIdx = openIdx > -1 ? openIdx : text.length;
      closeIdx = closeIdx > -1 ? closeIdx : text.length + 1;
      if (openIdx < text.length && openIdx < closeIdx) {
        numBraces ++;
        offset = openIdx + 1;
      }
      else if (closeIdx < text.length && closeIdx < openIdx) {
        numBraces --;
        offset = closeIdx + 1;
      }
      else {
        offset = text.length;
      }
    } while (numBraces > 0 && offset < text.length);
    buffer += text.slice(0, offset);
    if (numBraces === 0) {
      codfreqs.push(JSON.parse(buffer));
      const remains = text.slice(offset);
      if (remains.startsWith(sepMarker)) {
        buffer = '';
        unprocessedText = remains.slice(sepMarker.length);
      }
      else {
        allDone = true;
        break;
      }
    }
    if (done) {
      allDone = true;
      break;
    }
  } while (!allDone);
  return codfreqs;
}


/**
 * Restore a previously created task and stream progress events.
 *
 * @param taskKey - Unique identifier of the task.
 */
export async function * restoreTask(taskKey: string) {
  let loaded = false;
  yield {
    loaded,
    taskKey,
    step: 'create-task',
    description: 'Creating task...',
    count: 1,
    total: 1
  };
  yield {
    loaded,
    taskKey,
    step: 'trigger-runner',
    description: (
      'Triggering parallel task runners, this may take 1-2 minutes...'
    ),
    count: 1,
    total: 1
  };
  try {
    for await (const progress of fetchRunnerProgress(taskKey)) {
      yield {
        loaded,
        taskKey,
        ...progress
      };
    }
  }
  catch (e: any) {
    if (/this task is not triggered yet/.test(e.message)) {
      yield {
        loaded,
        taskKey,
        step: 'trigger-runner',
        description: 'Try fetching task results...',
        count: 1,
        total: 1
      };
    }
    else {
      throw e;
    }
  }
  const codfreqs = await fetchCodfreqs(taskKey);
  loaded = true;
  yield {
    loaded,
    taskKey,
    step: 'finish-task',
    description: 'Task finished.',
    count: 1,
    total: 1,
    codfreqs
  };
}


/**
 * Upload FASTQ pairs, trigger codfreq generation and stream progress.
 *
 * @param filePairs - Array of file pair descriptors.
 * @param runners - Runner configuration.
 * @param options - Task options sent to the API.
 */
export default async function * fastq2codfreq(filePairs: any[], runners: any, options: any) {
  const {taskKey} = await createTask(options);
  let loaded = false;
  yield {
    loaded,
    taskKey,
    step: 'create-task',
    description: 'Creating task...',
    count: 1,
    total: 1
  };
  for await (const progress of uploadFiles(taskKey, filePairs)) {
    yield {
      loaded,
      taskKey,
      ...progress
    };
  }
  await triggerRunner(taskKey, filePairs, runners);
  yield {
    loaded,
    taskKey,
    step: 'trigger-runner',
    description: (
      'Triggering parallel task runners, this may take 1-2 minutes...'
    ),
    count: 1,
    total: 1
  };
  for await (const progress of fetchRunnerProgress(taskKey)) {
    yield {
      loaded,
      taskKey,
      ...progress
    };
  }
  const codfreqs = await fetchCodfreqs(taskKey);
  loaded = true;
  yield {
    loaded,
    taskKey,
    step: 'finish-task',
    description: 'Task finished.',
    count: 1,
    total: 1,
    codfreqs
  };
}
