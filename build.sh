babel --presets es2015 queue.js -o index.js
babel --presets es2015 test/src/*.js -o test/index.js
echo 'build ok'