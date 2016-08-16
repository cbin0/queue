'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var evts = {
  new: 'new task',
  error: 'error',
  success: 'success'
};

var statuses = {
  unstart: 'unstart',
  doing: 'doing',
  done: 'done'
};

var Task = function (_EventEmitter) {
  _inherits(Task, _EventEmitter);

  function Task(taskFunc, tasks) {
    _classCallCheck(this, Task);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Task).call(this));

    _this2.id = _uuid2.default.v4();
    _this2.func = taskFunc;
    _this2.tasks = tasks;
    _this2.status = statuses.unstart;
    _this2.error = null;
    _this2.result = null;
    return _this2;
  }

  _createClass(Task, [{
    key: 'exec',
    value: function exec(cb) {
      var _this = this;
      var func = this.func;
      this.status = statuses.doing;
      func(function (error, res) {
        _this.status = statuses.done;
        if (error) {
          _this._error(error, cb);
        } else {
          _this._ok(res, cb);
        }
      });
    }
  }, {
    key: '_ok',
    value: function _ok(r, cb) {
      this.result = r;
      try {
        this.emit(evts.success, r);
      } catch (e) {/* IGNORE */}
      cb(null, r);
    }
  }, {
    key: '_error',
    value: function _error(e, cb) {
      this.error = e;
      try {
        this.emit(evts.error, e);
      } catch (e) {/* IGNORE */}
      cb(e);
    }
  }, {
    key: 'onSuccess',
    value: function onSuccess(handler) {
      this.on(evts.success, handler);
    }
  }, {
    key: 'onError',
    value: function onError(handler) {
      this.on(evts.error, handler);
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      return JSON.stringify({
        id: this.id,
        status: this.status,
        result: this.result,
        error: this.error
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.removeAllListeners(evts.success);
      this.removeAllListeners(evts.error);
      this.destroyed = true;
    }
  }]);

  return Task;
}(_events2.default);

var Queue = function (_EventEmitter2) {
  _inherits(Queue, _EventEmitter2);

  function Queue(options) {
    _classCallCheck(this, Queue);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Queue).call(this));

    var _this = _this3;
    _this3.options = _lodash2.default.defaults(options, {});
    _this3.tasks = [];
    _this3.completed = [];
    _this3.running = false;
    _this3.on(evts.new, function () {
      if (_this.running) {
        return;
      }
      _this.forever();
    });
    return _this3;
  }

  _createClass(Queue, [{
    key: '_exec',
    value: function _exec(task, done) {
      var _this = this;
      if (!task) {
        return done();
      }
      task.exec(function (error, res) {
        task.destroy();
        if (error) {
          _this.emit(evts.error, task);
        } else {
          _this.emit(evts.success, task);
        }
        _this.completed.unshift(task);
        _this.tasks.splice(0, 1);
        done();
      });
    }
  }, {
    key: '_stop',
    value: function _stop() {
      this.running = false;
    }
  }, {
    key: 'push',
    value: function push(task) {
      var t = new Task(task);
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

  }, {
    key: 'forever',
    value: function forever() {
      var _this = this;
      var task = this.tasks[0];
      if (!task) {
        return _this._stop();
      }
      this.running = true;
      this._exec(task, function () {
        if (_this.destroyed) {
          return;
        }
        _this.forever();
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.removeAllListeners(evts.new);
      this.removeAllListeners(evts.error);
      this.destroyed = true;
    }
  }]);

  return Queue;
}(_events2.default);

exports.default = Queue;
