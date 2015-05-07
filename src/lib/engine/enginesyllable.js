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
var Syllable = function Syllable(label, values, cost) {
  this.label = label;
  this.values = values;
  this.cost = cost;
};
Syllable.prototype.copy = function() {
  return new Syllable(this.label, this.values, this.cost);
};
// create hybrid Syllables
// TODO: provide appropriate label
// TODO: not the semantic of hybrid Syllables -> FIXME
Syllable.prototype.or = function(syllable) {
  return new Syllable(
    this.label + '_' + syllable.label,
    _(this.values).union(syllable.values),
    -1
  );
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
  Syllables[name] = new Syllable(name, [SyllableValue[name]], 1);
});
['NIF', 'KUN', 'RYO'].forEach(function(name) {
  Syllables[name] = new Syllable(name, [SyllableValue[name]], 2);
});
['YUN', 'REN', 'TO'].forEach(function(name) {
  Syllables[name] = new Syllable(name, [SyllableValue[name]], 3);
});
['GAM', 'XAU', 'EX'].forEach(function(name) {
  Syllables[name] = new Syllable(name, [SyllableValue[name]], 5);
});
['13TH_SYLLABLE', '14TH_SYLLABLE', '15TH_SYLLABLE', '16TH_SYLLABLE'].forEach(function(name) {
  Syllables[name] = new Syllable(name, [SyllableValue[name]], -1);
});
[ 'FIRE', 'WATER', 'EARTH', 'WIND', 'LIGHT', 'SHADOW'].forEach(function(name) {
  Syllables[name] = new Syllable(name, [SyllableValue[name], SyllableValue.ELEMENT], 2);
});
Syllables['7TH_ELEMENT'] = new Syllable('7TH_ELEMENT', [SyllableValue['7TH_ELEMENT'], SyllableValue.ELEMENT], -1);
Syllables.OMNIPOTENCE = new Syllable('OMNIPOTENCE', [
  SyllableValue.OMNIPOTENCE,
  SyllableValue.ELEMENT,
  SyllableValue.FIRE,
  SyllableValue.WATER,
  SyllableValue.EARTH,
  SyllableValue.WIND,
  SyllableValue.LIGHT,
  SyllableValue.SHADOW
], -1);
Syllables.SOL = new Syllable('SOL', [
  SyllableValue.SOL,
  SyllableValue.LIGHT,
  SyllableValue.ELEMENT
], -1);
Syllables.LUNA = new Syllable('LUNA', [
  SyllableValue.LUNA,
  SyllableValue.SHADOW,
  SyllableValue.ELEMENT
], -1);
[
  'FIRE', 'WATER', 'EARTH',
  'WIND', 'LIGHT', 'SHADOW',
  '7TH_ELEMENT'
].forEach(function(name) {
  Syllables[name + 'DUMMY'] = new Syllable(name + 'DUMMY', [
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

var SyllableBoardField = function SyllableBoardField(index) {
  this.index = index;
  this.type = 'default'
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
      this.syllableStones[i].push(undefined);
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
SyllableBoard.prototype.checkAndPlaceSyllable = function(index, syllable) {
  // field already occupied?
  if(this.getStone(index)) { return false; }
  // not enough SP?
  if(this.mage.sp < syllable.cost) { return false; }

  this.mage.sp -= syllable.cost;
  this.placeSyllable(index, syllable);

  console.log("PLACE SYLLABLE");
  return true;
};
SyllableBoard.prototype.switchSyllables = function(index1, index2) {
  // fields contain no syllables?
  if(!this.getStone(index1)) { return false; }
  if(!this.getStone(index2)) { return false; }
  // fields not neighbored?
  if(Math.abs(index1.x - index2.x) + Math.abs(index1.y - index2.y) != 1) { return false; }
  // not enough SP?
  if(this.mage.sp < 1) { return false; }

  var temp = this.syllableStones[index1.x][index1.y];
  this.syllableStones[index1.x][index1.y] = this.syllableStones[index2.x][index2.y];
  this.syllableStones[index2.x][index2.y] = temp;

  this.mage.sp -= 1;

  console.log("SWITCH SYLLABLES");
  return true;
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

// TODO: add toString methods
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

