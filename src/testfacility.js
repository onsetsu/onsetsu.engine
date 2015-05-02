// --------------------------------------------------------------------------------
// Test facility
// --------------------------------------------------------------------------------
var test = function test(func) {
  try {
    func();
  } catch(e) {
    console.log(e);
  }
};

var assert = function assert(bool, message) {
  if(!bool) {
    throw new Error(message);
  }
};
