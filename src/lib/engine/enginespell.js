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

var Spell = function() {};

// factory method to create new concrete Spells
Spell.createSpell = function(name, syllableSequences, effectText, effect) {

  var ConcreteSpellClass = function() {
    this.SpellClass = ConcreteSpellClass;
  };

  ConcreteSpellClass.spellName = name;

  ConcreteSpellClass.effectText = effectText;

  ConcreteSpellClass.effect = effect;
  ConcreteSpellClass.prototype.effect = effect;

  ConcreteSpellClass.getBaseSequences = function() {
    return syllableSequences;
  };
  ConcreteSpellClass.getBaseSequence = function(index) {
    return syllableSequences[index];
  };

  return ConcreteSpellClass;
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

SpellType.Sorcery = function Sorcery() {};
SpellType.Familiar = function Familiar() {};
SpellType.Enchantment = function Enchantment() {};
SpellType.Artifact = function Artifact() {};
SpellType.Mage = function Mage() {};

/**
 * Every Spell may have one or more SubTypes.
 * E.g. a Familiar may have the "Dwarf" and the "Engineer" SubTypes.
 */
var SubType = function SubType() {};
const SUBTYPE_GOBLIN = 'SUBTYPE_GOBLIN';
const SUBTYPE_OGRE = 'SUBTYPE_OGRE';
