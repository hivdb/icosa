import axios from 'axios';
import sleep from 'sleep-promise';

const API_SERVER = 'https://codfreq-api.hivdb.org';
const WT_CREATE_TASK = 1;
const WT_DIRECT_UPLOAD = 1;
const WT_TRIGGER_RUNNER = 1;


function calcUploadWeight(file) {
  return parseInt(file.size / 524288);
}


function calcRunnerWeight(file) {
  return parseInt(file.size / 65536);
}


function calcTotalFileWeight(files) {
  let sum = 0;
  for (const file of files) {
    sum += calcUploadWeight(file) + calcRunnerWeight(file);
  }
  return sum;
}


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
          const pcnt = evt.loaded / fileSize;
          if (pcnt >= 1) {
            return;
          }
          setTimeout(() => {
            resolve([pcnt, nextProgress]);
            resolve = nextResolve;
          }, 0);
        });
      }
    })
    .then(() => resolve([1, null]))
    .catch((e) => handleResponseError(e))
  );
  const fileWeight = calcUploadWeight(file);
  let floorWeight = 0;
  let accWeight = 0;
  while (progress !== null) {
    const payload = await progress;
    const pcnt = payload[0];
    progress = payload[1];
    if (pcnt < 1) {
      accWeight = fileWeight * pcnt;
      const newFloorWeight = Math.floor(accWeight);
      if (newFloorWeight > floorWeight) {
        yield {
          description: `Uploading ${file.name}...`,
          weight: newFloorWeight - floorWeight
        };
        floorWeight = newFloorWeight;
      }
    }
    else {
      yield {
        description: `Uploaded ${file.name}.`,
        weight: fileWeight - floorWeight
      };
    }
  }
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
    description: 'Retriving uploading credential...',
    weight: WT_DIRECT_UPLOAD
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


async function * triggerRunner(taskKey, files) {
  try {
    await axios.post(
      `${API_SERVER}/trigger-runner`, {
        taskKey,
        runners: [{
          reference: 'SARS2.S.fas',
          gene: 'S'
        }, {
          reference: 'SARS2.RdRP.fas',
          gene: 'RdRP'
        }]
      }
    );
  } catch (e) {
    handleResponseError(e);
  }
  yield {
    description: 'Triggering parallel task runners...',
    weight: WT_TRIGGER_RUNNER
  };
  const fileWeightMap = files.reduce((acc, f) => {
    acc[f.name] = calcRunnerWeight(f);
    return acc;
  }, {});
  let currentFileNames = {};
  let accWeights = {};
  let prevAccWeights = {};
  for await (const event of fetchRunnerLogs(taskKey)) {
    const {op, numTasks, ecsTaskId} = event;
    switch (op) {
      case 'progress': {
        const {count, total, fastqs} = event;
        const pcnt = count / total;
        const fnames = fastqs.filter(fn => fn).map(fn => {
          fn = fn.split('/');
          return fn[fn.length - 1];
        });
        currentFileNames[ecsTaskId] = fnames;
        let accWeight = 0;
        for (const fname of fnames) {
          accWeight += (
            pcnt * fileWeightMap[fname] / numTasks
          );
        }
        accWeights[ecsTaskId] = Math.floor(accWeight);
        if (
          !prevAccWeights[ecsTaskId] ||
          accWeights[ecsTaskId] < prevAccWeights[ecsTaskId]
        ) {
          prevAccWeights[ecsTaskId] = 0;
        }
        if (accWeights[ecsTaskId] > prevAccWeights[ecsTaskId]) {
          const fnames = getDistinctFileNames(Object.values(currentFileNames));
          yield {
            description: `Processing file(s) ${fnames.join(', ')}...`,
            weight: accWeights[ecsTaskId] - prevAccWeights[ecsTaskId]
          };
          prevAccWeights[ecsTaskId] = accWeights[ecsTaskId];
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
    await sleep(5000);
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


export default async function * fastq2codfreq(files) {
  let count = WT_CREATE_TASK;
  const total = (
    WT_CREATE_TASK +
    WT_DIRECT_UPLOAD +
    WT_TRIGGER_RUNNER +
    calcTotalFileWeight(files)
  );
  const {taskKey} = await createTask();
  let loaded = false;
  yield {
    loaded,
    description: 'Creating FASTQ-to-CodFreq task...',
    count, total
  };
  for await (const progress of uploadFiles(taskKey, files)) {
    const {description, weight} = progress;
    count += weight;
    yield {loaded, description, count, total};
  }
  for await (const progress of triggerRunner(taskKey, files)) {
    const {description, weight} = progress;
    count += weight;
    yield {loaded, description, count, total};
  }
  const codfreqs = await fetchCodfreqs(taskKey);
  loaded = true;
  yield {
    loaded,
    description: 'Task finished.',
    count: total,
    total,
    codfreqs
  };
}
