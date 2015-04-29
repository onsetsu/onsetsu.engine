// --------------------------------------------------------------------------------
// Syllable Board
// --------------------------------------------------------------------------------



// --------------------------------------------------------------------------------
// Syllable Board
// --------------------------------------------------------------------------------
var Fireball = new Spell('Fireball', [
  new SyllableSequence([Syllables.LIGHT, Syllables.CHI, Syllables.CHI, Syllables.NIF], SyllableSequence.ordered),
], 'Deal 2 Damage.', function effect() {}
);

var CLord = new Mage();
var CLordBoard = new SyllableBoard({ x: 8, y: 8 });
CLordBoard.placeSyllable({ x: 2, y: 3 }, Syllables.SOL);
CLordBoard.placeSyllable({ x: 2, y: 4 }, Syllables.CHI);
CLordBoard.placeSyllable({ x: 2, y: 5 }, Syllables.CHI);
CLordBoard.placeSyllable({ x: 2, y: 6 }, Syllables.NIF);
CLordBoard.placeSyllable({ x: 2, y: 7 }, Syllables.CHI);

CLordBoard.placeSyllable({ x: 1, y: 4 }, Syllables.FIRE);
CLordBoard.placeSyllable({ x: 3, y: 4 }, Syllables.CHI);
CLordBoard.placeSyllable({ x: 4, y: 4 }, Syllables.NIF);

var callback = function(spell, startIndex, direction) {
  console.log('YEAH', spell, startIndex, direction);
};

new SpellChecker().checkForSpell({ x: 2, y: 4 }, CLordBoard, Fireball, callback);

configureGameForTwoPlayers();
var engine = new Engine();
