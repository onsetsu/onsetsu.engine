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
