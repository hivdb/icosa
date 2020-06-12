import localforage from 'localforage';

function isBigData(key) {
  return typeof key === 'string' && key.startsWith('@@bigData/');
}

function randomKey() {
  const key = parseInt(Math.random() * 0x7fffffff, 10).toString(36);
  return '000000'.slice(key.length) + key;
}

async function load(key) {
  if (!isBigData(key)) {
    return key;
  }
  let data = await localforage.getItem(key);
  return JSON.parse(data);
}

async function save(data) {
  const key = `@@bigData/${randomKey()}`;
  data = JSON.stringify(data);
  await localforage.setItem(`*${key}`, Date.now());
  await localforage.setItem(key, data);
  return key;
}

async function remove(key) {
  if (!isBigData(key)) {
    return;
  }
  await localforage.removeItem(key);
  await localforage.removeItem(`*${key}`);
}

async function clear(timeout = 3600000) {
  const minTs = Date.now() - timeout;
  for (const key of await localforage.keys()) {
    if (typeof key === 'string' && isBigData(key)) {
      const ts = await localforage.getItem(`*${key}`);
      if (ts < minTs) {
        await remove(key);
      }
    }
  }
}

export default {isBigData, load, save, remove, clear};
