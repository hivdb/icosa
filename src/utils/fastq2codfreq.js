import axios from 'axios';
import sleep from 'sleep-promise';

const API_SERVER = 'https://codfreq-api.hivdb.org';


function handleResponseError(e) {
  if (!e.response || !e.response.data) {
    throw e;
  }
  const {error} = e.response.data;
  throw new Error(`Server rejected our request: ${error}`);
}


async function createTask() {
  let resp;
  try {
    resp = await axios.post(`${API_SERVER}/create-task`);
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
    .catch((e) => handleResponseError(e))
  );
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


async function * uploadFiles(taskKey, files) {
  const fileNames = files.map(f => f.name);
  let resp;
  try {
    resp = await axios.post(
      `${API_SERVER}/direct-upload`, {taskKey, fileNames}
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


function getDistinctFileNames(all_filenames) {
  const distinct = new Set();
  for (const filenames of all_filenames) {
    for (const fname of filenames) {
      distinct.add(fname);
    }
  }
  return Array.from(distinct);
}


async function triggerRunner(taskKey, files) {
  try {
    await axios.post(
      `${API_SERVER}/trigger-runner`, {
        taskKey,
        runners: [{
          profile: 'SARS2.json'
        }]
      }
    );
  } catch (e) {
    handleResponseError(e);
  }
}


async function * fetchRunnerProgress(taskKey) {
  let currentFileNames = {};
  let prevCount = 0;
  for await (const event of fetchRunnerLogs(taskKey)) {
    const {op, numTasks, ecsTaskId} = event;
    switch (op) {
      case 'progress': {
        const {count, total, fastqs} = event;
        const fnames = fastqs.filter(fn => fn).map(fn => {
          fn = fn.split('/');
          return fn[fn.length - 1];
        });
        currentFileNames[ecsTaskId] = fnames;
        if (count > prevCount) {
          const fnames = getDistinctFileNames(Object.values(currentFileNames));
          yield {
            step: `process-${ecsTaskId}-${fnames.join(', ')}`,
            description: `Processing file(s) ${fnames.join(', ')}...`,
            numParallels: numTasks,
            parallelTaskId: ecsTaskId,
            count,
            total
          };
          prevCount = count;
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
      resp = await axios.post(
        `${API_SERVER}/fetch-runner-logs`, {
          taskKey,
          ...(startTime ? {startTime: startTime.join(',')} : {})
        }
      );
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


async function fetchCodfreqs(taskKey) {
  let resp;
  try {
    resp = await axios.post(
      `${API_SERVER}/fetch-codfreqs`, {
        taskKey
      }
    );
  } catch (e) {
    handleResponseError(e);
  }
  return resp.data.codfreqs;
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


export default async function * fastq2codfreq(files) {
  const {taskKey} = await createTask();
  let loaded = false;
  yield {
    loaded,
    taskKey,
    step: 'create-task',
    description: 'Creating task...',
    count: 1,
    total: 1
  };
  for await (const progress of uploadFiles(taskKey, files)) {
    yield {
      loaded,
      taskKey,
      ...progress
    };
  }
  await triggerRunner(taskKey, files);
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
