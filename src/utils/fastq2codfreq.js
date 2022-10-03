import axios from 'axios';
import sleep from 'sleep-promise';

import {makeDownload} from './download';

const API_SERVER = 'https://codfreq-api.hivdb.org';


function handleResponseError(e) {
  if (!e.response || !e.response.data) {
    throw e;
  }
  const {error} = e.response.data;
  throw new Error(`Server rejected our request: ${error}`);
}


async function createTask(options) {
  let resp;
  try {
    resp = await axios.post(`${API_SERVER}/create-task`, {
      options
    });
  } catch (e) {
    handleResponseError(e);
  }
  const {
    taskKey,
    lastUpdatedAt,
    status
  } = resp.data;
  return {taskKey, lastUpdatedAt, status};
}


async function * uploadFile(file, url, fields) {
  const formData = new FormData();
  for (const name in fields) {
    formData.append(name, fields[name]);
  }
  formData.append('file', file);
  const fileSize = file.size;
  let progress = new Promise(resolve => axios
    .post(url, formData, {
      onUploadProgress: evt => {
        const nextProgress = new Promise(nextResolve => {
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
    .then(() => resolve([1, null]))
    .catch((e) => handleResponseError(e)));
  let prevCount = 0;
  while (progress !== null) {
    const payload = await progress;
    const count = payload[0];
    progress = payload[1];
    if (count < fileSize) {
      if (count > prevCount) {
        yield {
          step: `upload:${file.name}`,
          description: `Uploading ${file.name}...`,
          count,
          total: fileSize
        };
        prevCount = count;
      }
    }
  }
  yield {
    step: `upload:${file.name}`,
    description: `Uploaded ${file.name}`,
    count: fileSize,
    total: fileSize
  };
}


async function * uploadFiles(taskKey, filePairs) {
  const files = filePairs.reduce(
    (acc, {pair}) => [
      ...acc,
      ...pair.filter(f => f)
    ],
    []
  );
  const fileNames = files.map(({name}) => name);
  let resp;
  try {
    resp = await axios.post(
      `${API_SERVER}/direct-upload`,
      {taskKey, fileNames}
    );
  } catch (e) {
    handleResponseError(e);
  }
  const {
    presignedPosts
  } = resp.data;
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


async function triggerRunner(taskKey, filePairs, runners) {
  const pairInfo = filePairs.map(
    ({name, pair, n}) => ({
      name,
      pair: pair.map(f => f ? f.name : null),
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


async function * fetchRunnerProgress(taskKey) {
  let prevCounts = {};
  for await (const event of fetchRunnerLogs(taskKey)) {
    const {op, numTasks, ecsTaskId} = event;
    switch (op) {
      case 'preprocess': {
        const {status, query} = event;
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
        const {status, command, query} = event;
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
        const {status, query, target} = event;
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
        const {count, total, fastqs} = event;
        const fnames = fastqs.filter(fn => fn).map(fn => {
          fn = fn.split('/');
          return fn[fn.length - 1];
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


async function * fetchRunnerLogs(taskKey) {
  let startTime = undefined;
  while (true) {
    let resp;
    try {
      resp = await axios.post(`${API_SERVER}/fetch-runner-logs`, {
        taskKey,
        ...(startTime ? {startTime: startTime.join(',')} : {})
      });
    } catch (e) {
      handleResponseError(e);
    }
    const {status, taskEvents} = resp.data;
    const numTasks = taskEvents.length;
    const newStartTime = [];
    for (let i = 0; i < numTasks; i ++) {
      const curStartTs = startTime ? startTime[i] : 1;
      const {ecsTaskId, events} = taskEvents[i];
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


export async function downloadCodfreqs(taskKey) {
  let resp;
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
  makeDownload(
    'codfreqs.zip',
    'application/zip',
    await resp.blob(),
    true
  );
}


async function fetchCodfreqs(taskKey) {
  let resp;
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


export async function * restoreTask(taskKey) {
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
  catch (e) {
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


export default async function * fastq2codfreq(filePairs, runners, options) {
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
