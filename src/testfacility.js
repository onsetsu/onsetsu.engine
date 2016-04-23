// --------------------------------------------------------------------------------
// Test facility
// --------------------------------------------------------------------------------
export function test(func) {
  try {
    func();
  } catch(e) {
    console.log(e);
  }
}

export function assert(bool, message) {
  if(!bool) {
    throw new Error(message);
  }
}
