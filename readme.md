## Queue

A forever queue that accepts tasks which will be executed one by one.

### Usage

```javascript
var Queue = require('Queue');
var queue = new Queue();

setTimeout(function(){
  queue.push(function(cb) {
    setTimeout(function (params) {
      console.log("mession 1 complete.");
      cb(null, 'res 1'); 
    }, 4000);
  });
}, 2000);


setTimeout(function(){
  queue.push(function(cb) {
    setTimeout(function (params) {
      console.log("mession 2 complete.");
      cb(null, 'res 2');
    }, 2000);
  });
}, 3000);

setTimeout(function(){
  queue.push(function(cb) {
    setTimeout(function (params) {
      console.log("mession 3 complete.");
      cb(null, 'res 3');
    }, 4000);
  });
}, 10000);
```

this will print `mession 1 complete.` in 6s, `mession 2 complete.` in 8s, `mession 3 complete.` in 14s

## license
```
MIT
```