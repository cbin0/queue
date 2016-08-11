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

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var evts = {
  new: 'new task',
  error: 'error'
};

var statuses = {
  unstart: 'unstart',
  doing: 'doing',
  done: 'done'
};

var Task = function () {
  function Task(taskFunc, tasks) {
    _classCallCheck(this, Task);

    this.id = _uuid2.default.v4();
    this.func = taskFunc;
    this.tasks = tasks;
    this.status = statuses.unstart;
    this.error = null;
    this.result = null;
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
          _this.error(error, cb);
        } else {
          _this.ok(res, cb);
        }
      });
    }
  }, {
    key: 'ok',
    value: function ok(r, cb) {
      this.result = r;
      cb(null, r);
    }
  }, {
    key: 'error',
    value: function error(e) {
      this.error = e;
      cb(e);
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
  }]);

  return Task;
}();

var Queue = function (_EventEmitter) {
  _inherits(Queue, _EventEmitter);

  function Queue(options) {
    _classCallCheck(this, Queue);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Queue).call(this));

    var _this = _this2;
    _this2.options = _lodash2.default.defaults(options, {});
    _this2.tasks = [];
    _this2.completed = [];
    _this2.running = false;
    _this2.on(evts.new, function () {
      if (_this.running) {
        return;
      }
      _this.forever();
    });
    return _this2;
  }

  _createClass(Queue, [{
    key: '_exec',
    value: function _exec(task, done) {
      var _this = this;
      if (!task) {
        return done();
      }
      task.exec(function (error, res) {
        if (error) {
          _this.emit(evts.error, task);
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
        _this.forever();
      });
    }
  }]);

  return Queue;
}(_events2.default);

exports.default = Queue;
