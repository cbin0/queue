import _ from 'lodash';
import EventEmitter from 'events';
import uuid from 'uuid';

const evts = {
  new: 'new task',
  error: 'error',
  success: 'success'
}

const statuses = {
  unstart: 'unstart',
  doing: 'doing',
  done: 'done'
}

class Task extends EventEmitter {
  constructor (taskFunc, tasks) {
    super();
    this.id = uuid.v4();
    this.func = taskFunc;
    this.tasks = tasks;
    this.status = statuses.unstart;
    this.error = null;
    this.result = null;
  }
  exec (cb) {
    let _this = this;
    let func = this.func;
    this.status = statuses.doing;
    func((error, res) => {
      _this.status = statuses.done;
      if(error) {
        _this._error(error, cb);
      } else {
        _this._ok(res, cb);
      }
    });
  }
  _ok (r, cb) {
    this.result = r;
    try {
      this.emit(evts.success, r);
    } catch(e) { /* IGNORE */ }
    cb(null, r);
  }
  _error (e, cb) {
    this.error = e;
    try {
      this.emit(evts.error, e);
    } catch(e) { /* IGNORE */ }
    cb(e);
  }
  onSuccess (handler) {
    this.on(evts.success, handler);
  }
  onError (handler) {
    this.on(evts.error, handler);
  }
  toJson () {
    return JSON.stringify({
      id: this.id,
      status: this.status,
      result: this.result,
      error: this.error
    });
  }
  destroy () {
    this.removeAllListeners(evts.success);
    this.removeAllListeners(evts.error);
    this.destroyed = true;
  }
}

class Queue extends EventEmitter {
  constructor(options) {
    super();
    let _this = this;
    this.options = _.defaults(options, {

    });
    this.tasks = [];
    this.completed = [];
    this.running = false;
    this.on(evts.new, () => {
      if(_this.running) {
        return;
      }
      _this.forever();
    });
  }
  _exec (task, done) {
    let _this = this;
    if(!task) {
      return done();
    }
    task.exec((error, res) => {
      task.destroy();
      if(error) {
        _this.emit(evts.error, task);
      } else {
        _this.emit(evts.success, task);
      }
      _this.completed.unshift(task);
      _this.tasks.splice(0, 1);
      done();
    });
  }
  _stop() {
    this.running = false;
  }
  push (task) {
    let t = new Task(task);
    this.tasks.push(t);
    this.emit(evts.new);
    return t;
  }
  /*
  start (cb) {
    let _this = this;
    if(this.running)
      return this.emit(evts.error, 'Queue is running!');
    this.running = true;
    function run(index) {
      if(index >= _this.tasks.length) {
        return cb(_.map(_this.tasks, (task) => {
          return task.result;
        }));
      }
      this._exec(_this.tasks[index], () => {
        run(index + 1);
      });
    }
    run(0);
  }
  */
  forever () {
    let _this = this;
    let task = this.tasks[0];
    if(!task) {
      return _this._stop();
    }
    this.running = true;
    this._exec(task, () => {
      if(_this.destroyed) {
        return;
      }
      _this.forever();
    });
  }
  destroy () {
    this.removeAllListeners(evts.new);
    this.removeAllListeners(evts.error);
    this.destroyed = true;
  }
}

export default Queue;