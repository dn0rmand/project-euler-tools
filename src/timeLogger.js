"use strict";

const prettyHrtime = require("atlas-pretty-hrtime");
const debugging = !process.stdout.isTTY;

class TimeLogger {
  constructor(message) {
    this.time = 0n;
    this.timer = undefined;
    this.message = message;
    this.paused = false;
  }

  logEnd() {
    let msg = this.message ? ".. " : "";
    TimeLogger.log(`${msg}Executed in ${prettyHrtime(Number(this.time), 2)}`);
    if (!debugging) process.stdout.write("\r\n");
  }

  logStart() {
    if (!this.message) return;

    if (debugging) {
      console.log(this.message);
    } else {
      process.stdout.write(this.message);
      process.stdout.write(" ..");
    }
  }

  start() {
    this.logStart();
    this.time = 0n;
    this.timer = process.hrtime.bigint();
    this.paused = false;
  }

  stop() {
    this.pause();
    this.paused = false;
    this.logEnd();
  }

  pause() {
    if (this.timer === undefined) return; // Wasn't started!!!
    this.time += process.hrtime.bigint() - this.timer;
    this.timer = undefined;
    this.paused = true;
  }

  resume() {
    if (!this.paused) this.start();
    else this.timer = process.hrtime.bigint();
  }

  static log(message) {
    if (debugging) {
      console.log(message);
    } else {
      process.stdout.write(message);
    }
  }

  static wrap(message, action) {
    var logger = new TimeLogger(message);
    logger.start();
    try {
      return action();
    } catch (e) {
      logger.stop();
      throw e;
    } finally {
      logger.stop();
    }
  }

  static async wrapAsync(message, action) {
    var logger = new TimeLogger(message);
    logger.start();
    try {
      return await action();
    } catch (e) {
      logger.stop();
      throw e;
    } finally {
      logger.stop();
    }
  }
}

module.exports = TimeLogger;

/*
module.exports = function(title, action, postMessage)
{
    function logEnd(message, time)
    {
        if (message === undefined)
            message = "Executed in";

        if (debugging)
        {
            console.log(message, prettyHrtime(time, {verbose:true}));
        }
        else
        {
            process.stdout.write('.. ');
            process.stdout.write(`${message} ${prettyHrtime(time, {verbose:true})}\r\n`);
        }
    }

    function logStart(message)
    {
        if (debugging)
        {
            console.log(message);
        }
        else
        {
            process.stdout.write(message);
            process.stdout.write(' ..');
        }
    }

    logStart(title);

    let time = process.hrtime();
    try
    {
        return action();
    }
    catch(error)
    {
        postMessage = "Failed! " + error.message;
        throw error;
    }
    finally
    {
        time = process.hrtime(time);
        logEnd(postMessage, time);
    }
}
*/
