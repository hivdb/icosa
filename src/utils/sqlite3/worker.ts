/// <reference lib="WebWorker" />

import initSqlJs from 'sql.js';
import sqlWASM from 'sql.js/dist/sql-wasm.wasm';

/* eslint no-restricted-globals: ["error"] */

let db: any;

/**
 * Handle messages sent to the worker by executing SQLite operations.
 *
 * @param SQL - Initialized sql.js module.
 */
function onModuleReady(this: MessageEvent, SQL: any) {
  function createDb(data?: Uint8Array) {
    if (db != null) db.close();
    db = new SQL.Database(data);
    return db;
  }

  let buff: ArrayBuffer | undefined; let data: any; let result: any;
  data = (this as MessageEvent)["data"];
  const config = data["config"] ? data["config"] : {};
  switch (data && data["action"]) {
    case "open":
      buff = data["buffer"];
      createDb(buff && new Uint8Array(buff));
      return self.postMessage({
        id: data["id"],
        ready: true
      });
    case "exec":
      if (db === null) {
        createDb();
      }
      if (!data["sql"]) {
        throw new Error("exec: Missing query string");
      }
      return self.postMessage({
        id: data["id"],
        results: db.exec(data["sql"], data["params"], config)
      });
    case "each":
      if (db === null) {
        createDb();
      }
      const callback = function callback(row: any) {
        return self.postMessage({
          id: data["id"],
          row,
          finished: false
        });
      };
      const done = function done() {
        return self.postMessage({
          id: data["id"],
          finished: true
        });
      };
      return db.each(data["sql"], data["params"], callback, done, config);
    case "export":
      buff = db["export"]();
      result = {
        id: data["id"],
        buffer: buff
      };
      try {
        return self.postMessage(result, [result.buffer as ArrayBuffer]);
      } catch (error) {
        return self.postMessage(result);
      }
    case "close":
      if (db) {
        db.close();
      }
      return self.postMessage({
        id: data["id"]
      });
    default:
      throw new Error("Invalid action : " + (data && data["action"]));
  }
}

function onError(this: MessageEvent, err: any) {
  return self.postMessage({
    id: (this as MessageEvent)["data"]["id"],
    error: err["message"]
  });
}

if (typeof importScripts === "function") {
  db = null;
  const sqlModuleReady = initSqlJs({locateFile: () => sqlWASM});
  self.onmessage = function onmessage(event: MessageEvent) {
    return sqlModuleReady
      .then(onModuleReady.bind(event))
      .catch(onError.bind(event));
  };
}

export default {} as any;
