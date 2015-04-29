// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Circle = function Circle() {};

var Player = function Player() {};

var Team = function Team() {};

// TODO: separate owner and controller?
var Mage = function Mage(player, hp, syllableBoard, spellBook, syllablePool) {
  this.controller = player;
  this.hp = hp;
  this.syllableBoard = syllableBoard;
  this.spellBook = spellBook;
  this.syllablePool = syllablePool;
};

var Gem = function Gem() {};

// --------------------------------------------------------------------------------
// Syllable Board
// --------------------------------------------------------------------------------

// TODO: exchange Syllable costs with an instance of this class
var SyllablePoints = function SyllablePoints() {};

/**
 * Raw SyllableValue representing an atomic characteristic of a Syllable.
 */
var SyllableValue = function SyllableValue(value) {
  this.value = value;
};
SyllableValue.prototype.toString = function() {
  return this.value;
};
[
  'CHI', 'MA', 'PAI',
  'NIF', 'KUN', 'RYO',
  'YUN', 'REN', 'TO',
  'GAM', 'XAU', 'EX',
  '13TH_SYLLABLE', '14TH_SYLLABLE', '15TH_SYLLABLE', '16TH_SYLLABLE',
  'FIRE', 'WATER', 'EARTH',
  'WIND', 'LIGHT', 'SHADOW',
  'OMNIPOTENCE',
  'SOL', 'LUNA',
  '7TH_ELEMENT',
  'ELEMENT', 'DUMMY'
].forEach(function(name) {
  SyllableValue[name] = new SyllableValue(name);
});

/**
 * Syllable class.
 */
var Syllable = function Syllable(values, cost) {
  this.values = values;
  this.cost = cost;
};
Syllable.prototype.copy = function() {
  return new Syllable(this.values, this.cost);
};
// create hybrid Syllables
// TODO: not the semantic of hybrid Syllables -> FIXME
Syllable.prototype.or = function(syllable) {
  return new Syllable(_(this.values).union(syllable.values), -1);
};
Syllable.prototype.contains = function(syllableValue) {
  return _(this.values).contains(syllableValue);
};
// e.g. SOL is a LIGHT Syllable, but LIGHT is not a SOL Syllable.
Syllable.prototype.isA = function(syllable) {
  return typeof syllable !== 'undefined' &&
    _(syllable.values).difference(this.values).length === 0;
};

/**
 * Concrete Syllable prototypes to copy from.
 */
var Syllables = {};
['CHI', 'MA', 'PAI'].forEach(function(name) {
  Syllables[name] = new Syllable([SyllableValue[name]], 1);
});
['NIF', 'KUN', 'RYO'].forEach(function(name) {
  Syllables[name] = new Syllable([SyllableValue[name]], 2);
});
['YUN', 'REN', 'TO'].forEach(function(name) {
  Syllables[name] = new Syllable([SyllableValue[name]], 3);
});
['GAM', 'XAU', 'EX'].forEach(function(name) {
  Syllables[name] = new Syllable([SyllableValue[name]], 5);
});
['13TH_SYLLABLE', '14TH_SYLLABLE', '15TH_SYLLABLE', '16TH_SYLLABLE'].forEach(function(name) {
  Syllables[name] = new Syllable([SyllableValue[name]], -1);
});
[  'FIRE', 'WATER', 'EARTH', 'WIND', 'LIGHT', 'SHADOW'].forEach(function(name) {
  Syllables[name] = new Syllable([SyllableValue[name], SyllableValue.ELEMENT], 2);
});
Syllables['7TH_ELEMENT'] = new Syllable([SyllableValue['7TH_ELEMENT'], SyllableValue.ELEMENT], -1);
Syllables.OMNIPOTENCE = new Syllable([
  SyllableValue.OMNIPOTENCE,
  SyllableValue.ELEMENT,
  SyllableValue.FIRE,
  SyllableValue.WATER,
  SyllableValue.EARTH,
  SyllableValue.WIND,
  SyllableValue.LIGHT,
  SyllableValue.SHADOW
], -1);
Syllables.SOL = new Syllable([
  SyllableValue.SOL,
  SyllableValue.LIGHT,
  SyllableValue.ELEMENT
], -1);
Syllables.LUNA = new Syllable([
  SyllableValue.LUNA,
  SyllableValue.SHADOW,
  SyllableValue.ELEMENT
], -1);
[
  'FIRE', 'WATER', 'EARTH',
  'WIND', 'LIGHT', 'SHADOW',
  '7TH_ELEMENT'
].forEach(function(name) {
  Syllables[name + 'DUMMY'] = new Syllable([
    SyllableValue[name], SyllableValue.DUMMY
  ], -1);
});

/**
 * Contains the Syllables a mage can intonate.
 */
var SyllablePool = function SyllablePool(syllables) {
  this.syllables = syllables;
};

/**
 * Represents a Syllable on the SyllableBoard
 *
 * disabled
 */
var SyllableStone = function SyllableStone(syllable) {
  this.syllable = syllable;
  this.disabled = false;
};
at = 2;
is = 9;
var SyllableBoardField = function SyllableBoardField(index) {
  this.index = index;
};

var SyllableBoard = function SyllableBoard(size) {
  this.size = size;

  // construct field and stone matrix
  this.fields = [];
  this.syllableStones = [];
  for(var i = 0; i < this.size.x; i++) {
    this.fields.push([]);
    this.syllableStones.push([]);
    for(var j = 0; j < this.size.y; j++) {
      this.fields[i].push(new SyllableBoardField({ x: i, y: j }));
    }
  }
};
SyllableBoard.prototype.placeSyllable = function(index, syllable) {
  var stone = new SyllableStone(syllable);
  this.syllableStones[index.x][index.y] = stone;
};
SyllableBoard.prototype.getStone = function(index) {
  return this.syllableStones[index.x][index.y];
};
SyllableBoard.prototype.getColumn = function(x) {
  var column = [];
  for(var i = 0; i < this.size.y; i++) {
    column.push(this.getStone({ x: x, y: i }));
  }
  return column;
};
SyllableBoard.prototype.getRow = function(y) {
  var row = [];
  for(var i = 0; i < this.size.x; i++) {
    row.push(this.getStone({ x: i, y: y }));
  }
  return row;
};

var SpellChecker = function() {};
SpellChecker.prototype.checkForSpell = function(index, board, spell, callback) {
  var column = board.getColumn(index.x),
      row = board.getRow(index.y);

  this.stripeMatchesSpell(index, column, spell, Direction.vertical, callback);
  this.stripeMatchesSpell(index, row, spell, Direction.horizontal, callback);
};
// does only support a single sequence so far
// does only support ordered sequences so far
SpellChecker.prototype.stripeMatchesSpell = function(index, stripe, spell, direction, callback) {
  var sequence = spell.getSequence(0),
      indexOnStripe = direction === Direction.vertical ? index.y : index.x;

  if(spell.getSequences().length !== 1) { throw new Error('Multiple Sequences not supported'); }
  if(sequence.ordered === SyllableSequence.unordered) { throw new Error('Unordered Sequences not supported'); }

  function matchesStart(i) {
    return stripe[i] && stripe[i].syllable.isA(sequence.at(0));
  }

  function matchesSequenceBeginning(i) {
    var cast = true;
    for(var j = 0; j < sequence.getLength(); j++) {
      if(i+j >= stripe.length) {
        return false;
      }
      if(!(stripe[i+j] && stripe[i+j].syllable.isA(sequence.at(j)))) {
        cast = false;
      }
    }
    if((i <= indexOnStripe) && (indexOnStripe < i + sequence.getLength())) {
      return cast;
    }
  }

  for(var i = 0; i < stripe.length; i++) {
    if(matchesStart(i) && matchesSequenceBeginning(i)) {
      // call the given callback with the spell, its startingIndex and its direction
      callback(spell, {
        x: direction === Direction.horizontal ? i : index.x,
        y: direction === Direction.vertical ? i : index.y
      }, direction);
    }
  }
};

// Direction enum
Direction = {
  vertical: {},
  horizontal: {}
};

var SpellBook = function SpellBook() {
  this.spells = [];
};
SpellBook.prototype.getSpells = function() {
  return this.spells;
};
SpellBook.prototype.addSpell = function(spell) {
  if(!_(this.spells).contains(spell)) {
    this.spells.push(spell);
  }
};
SpellBook.prototype.removeSpell = function(spell) {
  var index = this.spells.indexOf(spell);
  if(index !== -1) {
    this.spells.splice(index, 1);
  }
};

/**
 * All Spells known to a Mage
 */
var SpellArchive = function SpellArchive() {};

var SpellRepository = function SpellRepository() {};

// --------------------------------------------------------------------------------
// Parts of a Spell
// --------------------------------------------------------------------------------

var SyllableSequence = function SyllableSequence(syllables, ordered) {
  this.syllables = syllables;
  this.ordered = ordered;
};
// DEPRECATED: only for ordered sequences
SyllableSequence.prototype.at = function(index) {
  if(this.ordered === SyllableSequence.unordered) { throw new Error('Unordered Sequences not supported'); }
  return this.syllables[index];
};
// DEPRECATED: only for fixed-length sequences
SyllableSequence.prototype.getLength = function() {
  return this.syllables.length;
};
SyllableSequence.ordered = true;
SyllableSequence.unordered = false;

var Spell = function Spell(name, syllableSequences, effectText, effect) {
  this.name = name;
  this.syllableSequences = syllableSequences;
  this.effectText = effectText;
  this.effect = effect;
};
Spell.prototype.getSequences = function() {
  return this.syllableSequences;
};
Spell.prototype.getSequence = function(index) {
  return this.syllableSequences[index];
};

/**
 * The SuperTypes all have rules text attached to them.
 */
var SuperType = function SuperType() {};

/**
 * Every Spell has at least one SpellType.
 * Each SpellType has its own rules for how objects with that type
 * are played, cast, or otherwise handled during gameplay.
 */
var SpellType = function SpellType() {};

var Sorcery = function Sorcery() {};

var Familiar = function Familiar() {};

var Enchantment = function Enchantment() {};

var Artifact = function Artifact() {};

/**
 * Every Spell may have one or more SubTypes.
 * E.g. a Familiar may have the "Dwarf" and the "Engineer" SubTypes.
 */
var SubType = function SubType() {};

// --------------------------------------------------------------------------------
// Battlefield
// --------------------------------------------------------------------------------

var Zone = function Zone() {};

var Battlefield = function Battlefield() {};

var Permanent = function Permanent() {};

// wraps a Permanent that is referenced by the Battlefield
var PermanentWrapper = function PermanentWrapper() {};

var Battle = function Battle() {};

// --------------------------------------------------------------------------------
// Timeline
// --------------------------------------------------------------------------------

var Timeline = function Timeline() {};

var Action = function Action() {};

// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Stack = function Stack() {};

var Game = function Game() {
  this.players = [];
  this.battlefield = new Battlefield();
  this.timeline = new Timeline();
};
Game.prototype.addPlayer = function(player) {
  this.players.push(player);
};

var Engine = function Engine() {};

// --------------------------------------------------------------------------------
// Variants
// --------------------------------------------------------------------------------

createStandardSyllablePool = function() {
  return new SyllablePool([
    Syllables.CHI,
    Syllables.MA,
    Syllables.PAI,
    Syllables.NIF,
    Syllables.KUN,
    Syllables.RYO,
    Syllables.YUN,
    Syllables.REN,
    Syllables.TO,
    Syllables.GAM,
    Syllables.XAU,
    Syllables.EX,
    Syllables.FIRE,
    Syllables.WATER,
    Syllables.EARTH,
    Syllables.WIND,
    Syllables.LIGHT,
    Syllables.SHADOW
  ]);
};

createTestSpellbook = function() {
  var Fireball = new Spell(
    'Fireball',
    [
      new SyllableSequence([
        Syllables.FIRE,
        Syllables.CHI,
        Syllables.NIF
      ], SyllableSequence.ordered),
    ],
    'Deal 2 Damage.',
    function effect() {}
  );

  var GreatFireball = new Spell(
    'Great Fireball',
    [
      new SyllableSequence([
        Syllables.FIRE,
        Syllables.CHI,
        Syllables.NIF,
        Syllables.NIF,
        Syllables.GAM
      ], SyllableSequence.ordered),
    ],
    'Deal 5 Damage.',
    function effect() {}
  );

  var spellBook = new SpellBook();
  [Fireball, GreatFireball].forEach(spellBook.addSpell.bind(spellBook));
  return spellBook;
};

configureGameForTwoPlayers = function() {
  var players = [new Player(), new Player()];
  var mages = players.map(function(player) {
    return new Mage(
      player,
      20,
      new SyllableBoard({ x: 8, y: 8 }),
      createTestSpellbook(),
      createStandardSyllablePool()
    );
  });

  players.forEach(function(player) { game.addPlayer.bind(game); });
}

game = new Game();