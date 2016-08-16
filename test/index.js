'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _queue = require('../../queue');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Queue', function () {
  describe('push ok', function () {
    it('queue get value should be 2', function (done) {
      var q = new _queue2.default();
      var val = 1;
      var t = q.push(function (cb) {
        setTimeout(function () {
          cb(null, val += 1);
        }, 500);
      });
      q.on('success', function (t) {
        _assert2.default.equal(t.result, 2);
        q.destroy();
        done();
      });
      _assert2.default.equal(val, 1);
    });
    it('value should be 2', function (done) {
      var q = new _queue2.default();
      var val = 1;
      var t = q.push(function (cb) {
        setTimeout(function () {
          cb(null, val += 1);
        }, 500);
      });
      t.onSuccess(function (val) {
        _assert2.default.equal(val, 2);
        q.destroy();
        done();
      });
      _assert2.default.equal(val, 1);
    });
  });
  describe('push error', function () {
    it('queue should throw error', function (done) {
      var q = new _queue2.default();
      var t = q.push(function (cb) {
        setTimeout(function () {
          cb('something wrong!');
        }, 500);
      });
      q.on('error', function (t) {
        _assert2.default.equal(t.error, 'something wrong!');
        q.destroy();
        done();
      });
    });
    it('task should throw error', function (done) {
      var q = new _queue2.default();
      var t = q.push(function (cb) {
        setTimeout(function () {
          cb('something wrong!');
        }, 500);
      });
      t.onError(function (e) {
        _assert2.default.equal(e, 'something wrong!');
        q.destroy();
        done();
      });
    });
  });
  describe('order', function () {
    it('order should current', function (done) {
      var q = new _queue2.default();
      q.forever();
      var val = 1;
      q.push(function (cb) {
        setTimeout(function () {
          val += 1;
          cb();
        }, 600);
      });
      q.push(function (cb) {
        setTimeout(function () {
          val += 3;
          cb();
        }, 400);
      });
      _assert2.default.equal(val, 1);
      setTimeout(function () {
        _assert2.default.equal(val, 2);
      }, 600);
      setTimeout(function () {
        _assert2.default.equal(val, 5);
        q.destroy();
        done();
      }, 1100);
    });
  });
});
