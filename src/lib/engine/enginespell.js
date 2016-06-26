export function SyllableSequence(syllables, ordered) {
  this.syllables = syllables;
  this.ordered = ordered;
}
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

export function Spell() {}

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
// TODO: unused
var SuperType = function SuperType() {};

/**
 * Every Spell has at least one SpellType.
 * Each SpellType has its own rules for how objects with that type
 * are played, cast, or otherwise handled during gameplay.
 */
export function SpellType() {}

SpellType.Sorcery = function Sorcery() {};
SpellType.Familiar = function Familiar() {};
SpellType.Enchantment = function Enchantment() {};
SpellType.Artifact = function Artifact() {};
SpellType.Mage = function Mage() {};

/**
 * Every Spell may have one or more SubTypes.
 * E.g. a Familiar may have the "Dwarf" and the "Engineer" SubTypes.
 */
// TODO: unused
var SubType = function SubType() {};

// races
export const SUBTYPE_HUMAN = 'SUBTYPE_HUMAN';
export const SUBTYPE_GOBLIN = 'SUBTYPE_GOBLIN';
export const SUBTYPE_OGRE = 'SUBTYPE_OGRE';

// classes
export const SUBTYPE_SHAMAN = 'SUBTYPE_SHAMAN';
export const SUBTYPE_KNIGHT = 'SUBTYPE_KNIGHT';
export const SUBTYPE_PRIEST = 'SUBTYPE_PRIEST';
export const SUBTYPE_WIZARD = 'SUBTYPE_WIZARD';

// misc
export const SUBTYPE_ELEMENTAL = 'SUBTYPE_ELEMENTAL';
export const SUBTYPE_SPIRIT = 'SUBTYPE_SPIRIT';
export const SUBTYPE_GOLEM = 'SUBTYPE_GOLEM';
export const SUBTYPE_DEMON = 'SUBTYPE_DEMON';

// attributes
export const SUBTYPE_LIGHTNING = 'SUBTYPE_LIGHTNING';
export const SUBTYPE_ICE = 'SUBTYPE_ICE';
