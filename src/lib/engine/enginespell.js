// --------------------------------------------------------------------------------
// Parts of a Spell
// --------------------------------------------------------------------------------

var SyllableSequence = function SyllableSequence(syllables, ordered) {
  this.syllables = syllables;
  this.ordered = ordered;
};
SyllableSequence.prototype.getSyllables = function() {
  return this.syllables;
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
