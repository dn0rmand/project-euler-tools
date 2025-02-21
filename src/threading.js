const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const Tracer = require("./tracer");

const awaitable = (worker, progressCallback) =>
  new Promise((resolve, reject) => {
    worker.on("message", ({ type, value }) => {
      if (type === "done") {
        resolve(value);
      } else if (type === "status") {
        progressCallback(value);
      }
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`stopped with ${code} exit code`));
      }
    });
  });

let workers = [];
let progress = [];
let tracer = new Tracer(true);

function reset() {
  workers = [];
  progress = [];
  tracer = new Tracer(true);
}

function postProgress(value) {
  parentPort.postMessage({ type: "status", value });
}

function postResult(value) {
  parentPort.postMessage({ type: "done", value });
}

function createJob(data) {
  const w = new Worker(data.filename, { workerData: data });
  const index = workers.length;

  workers.push(
    awaitable(w, (value) => {
      progress[index] = value;
      tracer.print(() => progress.join(" - "));
    }),
  );
}

async function waitJobs(doneCallback) {
  const results = await Promise.all(workers);

  results.forEach((result) => doneCallback(result));
  tracer.clear();
}

module.exports = {
  createJob: createJob,
  waitJobs: waitJobs,
  postProgress: postProgress,
  postResult: postResult,
  reset: reset,
  isMainThread: isMainThread,
  data: workerData,
};
