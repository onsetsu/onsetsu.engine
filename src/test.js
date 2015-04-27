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

// --------------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------------
test(function() {
  assert(Syllables.CHI.isA(Syllables.CHI));
  assert(!Syllables.CHI.isA(Syllables.FIRE));
  assert(Syllables.OMNIPOTENCE.isA(Syllables.FIRE));
  assert(!Syllables.OMNIPOTENCE.isA(Syllables.SOL));
  assert(!Syllables.FIRE.isA(Syllables.FIREDUMMY));
  assert(Syllables.FIRE.isA(Syllables.FIRE.copy()));
});

// TODO: incorrect semantics
test(function() {
  var CHIorNIF = Syllables.CHI.or(Syllables.NIF);
  assert(CHIorNIF.isA(Syllables.CHI));
  assert(CHIorNIF.isA(Syllables.NIF));
  assert(!Syllables.NIF.isA(CHIorNIF));

  assert(CHIorNIF.contains(SyllableValue.NIF));
  assert(!CHIorNIF.contains(SyllableValue.EX));
});

test(function() {
  var CLord = new Mage();
  var CLordBoard = new SyllableBoard({ x: 5, y: 5 }, CLord);

  //assert(1 == 2, "AAAAARGH");
});



