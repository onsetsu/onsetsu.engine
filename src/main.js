// --------------------------------------------------------------------------------
// Syllable Board
// --------------------------------------------------------------------------------
var engine = new Engine();


// --------------------------------------------------------------------------------
// Syllable Board
// --------------------------------------------------------------------------------
var Fireball = new Spell('Fireball', [
  new SyllableSequence([Syllables.CHI, Syllables.NIF, Syllables.CHI], SyllableSequence.ordered),
], 'Deal 2 Damage.', function effect() {}
);

var CLord = new Mage();
var CLordBoard = new SyllableBoard({ x: 8, y: 8 }, CLord);
CLordBoard.placeSyllable({ x: 2, y: 3 }, Syllables.CHI);
CLordBoard.placeSyllable({ x: 2, y: 4 }, Syllables.NIF);
CLordBoard.placeSyllable({ x: 2, y: 5 }, Syllables.CHI);
CLordBoard.placeSyllable({ x: 2, y: 6 }, Syllables.NIF);
CLordBoard.placeSyllable({ x: 2, y: 7 }, Syllables.CHI);

CLordBoard.placeSyllable({ x: 1, y: 4 }, Syllables.FIRE);
CLordBoard.placeSyllable({ x: 3, y: 4 }, Syllables.NIF);

var callback = function() {
  console.log('YEAH');
};

new SpellChecker().checkForSpell({ x: 2, y: 5 }, CLordBoard, Fireball, callback);

