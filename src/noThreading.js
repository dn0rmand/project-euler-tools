const Tracer = require("./tracer");

let workers = [];
let tracer = new Tracer(true);
let postMessage = () => {};

function reset() {
  workers = [];
  progress = [];
  tracer = new Tracer(true);
  postMessage = () => {};
}

function postProgress(value) {
  postMessage({ type: "status", value });
}

function postResult(value) {
  postMessage({ type: "done", value });
}

function createJob(data, jobFunction) {
  postMessage = ({ type, value }) => {
    if (type === "status") {
      tracer.print(() => value);
    } else if (type === "done") {
      workers.push(value);
    }
  };

  jobFunction(data);
}

async function waitJobs(doneCallback) {
  workers.forEach((result) => doneCallback(result));
  tracer.clear();

  await new Promise((resolve) => {
    resolve();
  });
}

module.exports = {
  createJob: createJob,
  waitJobs: waitJobs,
  postProgress: postProgress,
  postResult: postResult,
  reset: reset,
  isMainThread: true,
  data: {},
};
