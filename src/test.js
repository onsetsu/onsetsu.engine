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
  var spellsCasted = 0;
  var TestSkill = new Spell(
    'TestSkill',
    [
      new SyllableSequence([
        Syllables.LIGHT,
        Syllables.CHI,
        Syllables.CHI,
        Syllables.NIF
      ], SyllableSequence.ordered),
    ],
    'Test description.',
    function effect() {}
  );

  var TestMageBoard = new SyllableBoard({ x: 8, y: 8 });
  TestMageBoard.placeSyllable({ x: 2, y: 3 }, Syllables.SOL);
  TestMageBoard.placeSyllable({ x: 2, y: 4 }, Syllables.CHI);
  TestMageBoard.placeSyllable({ x: 2, y: 5 }, Syllables.CHI);
  TestMageBoard.placeSyllable({ x: 2, y: 6 }, Syllables.NIF);
  TestMageBoard.placeSyllable({ x: 2, y: 7 }, Syllables.CHI);

  TestMageBoard.placeSyllable({ x: 1, y: 4 }, Syllables.LIGHT);
  TestMageBoard.placeSyllable({ x: 3, y: 4 }, Syllables.CHI);
  TestMageBoard.placeSyllable({ x: 4, y: 4 }, Syllables.NIF);

  var callback = function(spell, startIndex, direction) {
    assert(startIndex.x === (direction === Direction.horizontal ? 1 : 2));
    assert(startIndex.y === (direction === Direction.vertical ? 3 : 4));
    spellsCasted += 1;
  };

  new SpellChecker().checkForSpell({ x: 2, y: 4 }, TestMageBoard, TestSkill, callback);

  assert(spellsCasted === 2, "AAAAARGH");
});



