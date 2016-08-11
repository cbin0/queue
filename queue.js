import _ from 'lodash';
import EventEmitter from 'events';
import uuid from 'uuid';

const evts = {
  new: 'new task',
  error: 'error'
}

const statuses = {
  unstart: 'unstart',
  doing: 'doing',
  done: 'done'
}

class Task {
  constructor (taskFunc, tasks) {
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
        _this.error(error, cb);
      } else {
        _this.ok(res, cb);
      }
    });
  }
  ok (r, cb) {
    this.result = r;
    cb(null, r);
  }
  error (e) {
    this.error = e;
    cb(e);
  }
  toJson () {
    return JSON.stringify({
      id: this.id,
      status: this.status,
      result: this.result,
      error: this.error
    });
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
      if(error) {
        _this.emit(evts.error, task);
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
      _this.forever();
    });
  }
}

export default Queue;