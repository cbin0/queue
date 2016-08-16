import assert from 'assert';
import Queue from '../../queue';

describe('Queue', function() {
  describe('push ok', function() {
    it('queue get value should be 2', function(done) {
      let q = new Queue();
      let val = 1;
      let t = q.push((cb) => {
        setTimeout(() => {
          cb(null, val += 1);
        }, 500);
      });
      q.on('success', (t) => {
        assert.equal(t.result, 2);
        q.destroy();
        done();
      });
      assert.equal(val, 1);
    });
    it('value should be 2', function(done) {
      let q = new Queue();
      let val = 1;
      let t = q.push((cb) => {
        setTimeout(() => {
          cb(null, val += 1);
        }, 500);
      });
      t.onSuccess((val) => {
        assert.equal(val, 2);
        q.destroy();
        done();
      });
      assert.equal(val, 1);
    });
  });
  describe('push error', function() {
    it('queue should throw error', function(done) {
      let q = new Queue();
      let t = q.push((cb) => {
        setTimeout(() => {
          cb('something wrong!');
        }, 500);
      });
      q.on('error', (t) => {
        assert.equal(t.error, 'something wrong!');
        q.destroy();
        done();
      });
    });
    it('task should throw error', function(done) {
      let q = new Queue();
      let t = q.push((cb) => {
        setTimeout(() => {
          cb('something wrong!');
        }, 500);
      });
      t.onError((e) => {
        assert.equal(e, 'something wrong!');
        q.destroy();
        done();
      });
    });
  });
  describe('order', function() {
    it('order should current', function(done) {
      let q = new Queue();
      q.forever();
      let val = 1;
      q.push((cb) => {
        setTimeout(() => {
          val += 1;
          cb();
        }, 600);
      });
      q.push((cb) => {
        setTimeout(() => {
          val += 3;
          cb();
        }, 400);
      });
      assert.equal(val, 1);
      setTimeout(() => {
        assert.equal(val, 2);
      }, 600);
      setTimeout(() => {
        assert.equal(val, 5);
        q.destroy();
        done();
      }, 1100);
    });
  });
});