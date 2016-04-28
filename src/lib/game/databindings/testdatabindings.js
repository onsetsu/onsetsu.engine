import { test, assert } from './../../../testfacility.js';

test(function() {
  var obj = {
    attr: 17,
    check: false
  };

  DataBindings.watch(obj, 'attr', function() {
    obj.check = true;
  });

  assert(obj.attr === 17);
  obj.attr = 42;
  assert(obj.attr === 42);
  assert(obj.check);
});

test(function() {
  var arr = [17];

  DataBindings.watch(arr, 0, function() {
    arr[1] = true;
  });

  assert(arr[0] === 17);
  arr[0] = 42;
  assert(arr[0] === 42);
  assert(arr[1]);
});

