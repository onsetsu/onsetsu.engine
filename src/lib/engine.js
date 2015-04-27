var Circle = function Circle() {};

var Player = function Player() {};

var Team = function Team() {};

var Mage = function Mage() {};

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

};

/**
 * Represents a Syllable on the SyllableBoard
 *
 * disabled
 */
var SyllableStone = function SyllableStone(syllable) {

};

var SyllableBoardField = function SyllableBoardField() {

};

var SyllableBoard = function SyllableBoard(boardSize, mage) {

};

var SpellBook = function SpellBook() {};

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

var Spell = function Spell(name, syllableSequences, effectText, effect) {
  this.name = name;
  this.syllableSequences = syllableSequences;
  this.effectText = effectText;
  this.effect = effect;
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

var Sorcery = function Sorcery() {};

var Permanent = function Permanent() {};

var Familiar = function Familiar() {};

var Enchantment = function Enchantment() {};

var Artifact = function Artifact() {};

var Battle = function Battle() {};

// --------------------------------------------------------------------------------
// Timeline
// --------------------------------------------------------------------------------

var Timeline = function Timeline() {};

// --------------------------------------------------------------------------------
// Timeline
// --------------------------------------------------------------------------------

var Stack = function Stack() {};

var Game = function Game() {};

var Engine = function Engine() {};

