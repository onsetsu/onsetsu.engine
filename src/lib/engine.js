// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Circle = function Circle() {};

var Player = function Player() {
  this.mages = [];
};

var Team = function Team() {};

// TODO: separate owner and controller?
var Mage = function Mage(player, hp, sp, syllableBoard, spellBook, syllablePool) {
  this.controller = player;
  player.mages.push(this);
  this.hp = hp;
  this.maxSp = sp;
  this.sp = sp;
  this.syllableBoard = syllableBoard;
  syllableBoard.mage = this;
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

// --------------------------------------------------------------------------------
// Battlefield
// --------------------------------------------------------------------------------

var Zone = function Zone() {};

var Battlefield = function Battlefield() {
  this.mages = [];
  this.permanents = [];
};
Battlefield.prototype.addMage = function(mage) {
  this.mages.push(mage);
};

var Permanent = function Permanent() {};

// wraps a Permanent that is referenced by the Battlefield
var PermanentWrapper = function PermanentWrapper() {};

var Battle = function Battle() {};

// --------------------------------------------------------------------------------
// Timeline
// --------------------------------------------------------------------------------

var TimelineSlot = function(delay) {
  this.delay = delay;
  this.actions = [];
};
TimelineSlot.prototype.addAction = function(action) {
  this.actions.push(action);
  //action.timelineSlot = this;
};
TimelineSlot.prototype.toString = function() {
  return 'SLOT ' + this.actions.length + ' actions';
};

var Timeline = function Timeline() {
  this.actions = [];

  var zeroTimelineSlot = new TimelineSlot(0);
  this.negativeTimelineSlots = [zeroTimelineSlot];
  this.positiveTimelineSlots = [zeroTimelineSlot];
};
Timeline.prototype.addAction = function(action) {
  this.actions.push(action);
  this.getSlotAt(action.baseDelay).addAction(action);
};
Timeline.prototype.getSlotAt = function(delay) {
  function getOrCreate(arr, delay) {
    if(arr[delay]) {
      return arr[delay];
    }
    return arr[delay] = new TimelineSlot(delay);
  }
  if(delay < 0) {
    return getOrCreate(this.negativeTimelineSlots, -delay);
  } else {
    return getOrCreate(this.positiveTimelineSlots, delay);
  }
};
Timeline.prototype.nextAction = function() {
  // search the TimelineSlot with the lowest negative delay that contains an action
  var action = _.reduceRight(this.negativeTimelineSlots, function(action, timelineSlot) {
    if(action) { return action; }
    return timelineSlot.actions.shift();
  }, undefined);
  return action;
};
Timeline.prototype.getTimelineSlotFor = function(action) {
  var timelineSlot = _(this.negativeTimelineSlots).find(function(timelineSlot) {
    if(!timelineSlot) { return false; }
    return _(timelineSlot.actions).contains(action);
  }) || _(this.positiveTimelineSlots).find(function(timelineSlot) {
    if(!timelineSlot) { return false; }
    return _(timelineSlot.actions).contains(action);
  });
  return timelineSlot;
};
// advances all actions by 1 time unit
Timeline.prototype.advance = function() {
  var startIndex = -(this.negativeTimelineSlots.length - 1);
  var endIndex = this.positiveTimelineSlots.length - 1;
  for(var index = startIndex; index <= endIndex; index += 1) {
    var slot = this.getSlotAt(index);
    if(!_.isEmpty(slot.actions)) {
      var action = undefined,
          prevSlot = this.getSlotAt(index-1);
      while(action = slot.actions.shift()) {
        prevSlot.addAction(action);
      }
    }
  }
};
Timeline.prototype.resetAction = function(action) {
  this.getSlotAt(action.baseDelay).addAction(action);
};
Timeline.prototype.print = function() {
  var str = '';
  var startIndex = this.negativeTimelineSlots.length - 1;
  var endIndex = this.positiveTimelineSlots.length - 1;
  for(var index = startIndex; index > 0; index -= 1) {
    str += '-' + index + ' ' + this.negativeTimelineSlots[index] + ' \n';
  }
  for(var index = 0; index <= endIndex; index += 1) {
    str += '+' + index + ' ' + this.positiveTimelineSlots[index] + ' \n';
  }
  console.log(str);
};

var Action = function Action(executable, baseDelay, recurring) {
  this.executable = executable;
  this.baseDelay = baseDelay;
  this.recurring = recurring;
};
// TODO: add toString methods
// Recurring enum
Action.oneShot = {};
Action.recurring = {};

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
  player.mages.forEach(function(mage) {
    this.battlefield.addMage(mage);
  }, this);
};

var Engine = function Engine() {};

// --------------------------------------------------------------------------------
// Utilities
// --------------------------------------------------------------------------------

tryPlaceSyllableAndCastSpells = function(insertionIndex, syllableBoard, syllable, callback) {
  var syllablePlaced = syllableBoard.checkAndPlaceSyllable(
    insertionIndex,
    syllable
  );
  if(syllablePlaced) {
    var spellChecker = new SpellChecker();

    syllableBoard.mage.spellBook.spells.forEach(function(spell) {
      spellChecker.checkForSpell(
        insertionIndex,
        syllableBoard,
        spell,
        callback
      );
    });
  }
};

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

  var KissOfDeath = new Spell(
     'Kiss of Death',
     [
       new SyllableSequence([
         Syllables.LUNA,
         Syllables.GAM,
         Syllables['13TH_SYLLABLE'],
         Syllables['13TH_SYLLABLE'],
         Syllables['14TH_SYLLABLE'],
         Syllables['15TH_SYLLABLE'],
         Syllables['16TH_SYLLABLE'],
         Syllables.TO,
         Syllables.CHI,
         Syllables.GAM
       ], SyllableSequence.ordered),
     ],
     'Destroy a Mage.',
     function effect() {}
   );

  var TurquoiseInferno = new Spell(
     'Turquoise Inferno',
     [
       new SyllableSequence([
         Syllables['7TH_ELEMENT'],
         Syllables.GAM,
         Syllables['13TH_SYLLABLE'],
         Syllables.EX,
         Syllables.CHI,
         Syllables['13TH_SYLLABLE']
       ], SyllableSequence.ordered),
     ],
     'Massive AoE Damage using the 7th Element.',
     function effect() {}
   );

  var SwordOfGeminiWings = new Spell(
     'Sword of Gemini Wings',
     [
       new SyllableSequence([
         Syllables.SOL,
         Syllables.EARTH,
         Syllables.GAM,
         Syllables.TO,
         Syllables.CHI,
         Syllables.XAU
       ], SyllableSequence.ordered),
     ],
`4/3 WeaponAngel Artifact Familiar
LightForge.
If [this] was lightforged: Cast Schild of Gemini Wings.
Equip to a Light Familiar.
[this] and the equipped familiar get:
"If [this] battles an enemy Familiar: reduce its AT by 1."`,

     function effect() {}
   );

  var ElementCurse = new Spell(
     'Element Curse',
     [
       new SyllableSequence([
         Syllables.OMNIPOTENCE,
         Syllables.CHI,
         Syllables.TO,
         Syllables.MA
       ], SyllableSequence.ordered),
     ],
`Target opponent disables an Element Syllable.
You may place a copy of that Syllable.`,
     function effect() {}
   );

  var MeteorStrike = new Spell(
     'Meteor Strike',
     [
       new SyllableSequence([
         Syllables.FIRE,
         Syllables.GAM,
         Syllables.RYO,
         Syllables.NIF
       ], SyllableSequence.ordered),
     ],
`Delay 5: Deal 4 Damage to a Familiar.`,
     function effect() {}
   );

  var spellBook = new SpellBook();
  [
    Fireball,
    GreatFireball,
    KissOfDeath,
    TurquoiseInferno,
    SwordOfGeminiWings,
    ElementCurse,
    MeteorStrike
  ].forEach(spellBook.addSpell.bind(spellBook));
  return spellBook;
};

configureGameForTwoPlayers = function() {
  var players = [new Player(), new Player()];
  var mages = players.map(function(player) {
    return new Mage(
      player,
      20,
      10,
      new SyllableBoard({ x: 8, y: 8 }),
      createTestSpellbook(),
      createStandardSyllablePool()
    );
  });

  var sampleBoard = mages[0].syllableBoard;
  sampleBoard.placeSyllable({ x: 0, y: 3 }, Syllables.FIRE);
  sampleBoard.placeSyllable({ x: 1, y: 3 }, Syllables.CHI);
  sampleBoard.placeSyllable({ x: 2, y: 3 }, Syllables.NIF);
  sampleBoard.placeSyllable({ x: 4, y: 3 }, Syllables.NIF);
  sampleBoard.placeSyllable({ x: 3, y: 3 }, Syllables.GAM);
  sampleBoard.switchSyllables({ x: 4, y: 3 }, { x: 3, y: 3 });

  players.forEach(game.addPlayer.bind(game));

  game.timeline.addAction(new Action({ execute: function() { console.log('First'); }}, 4, Action.recurring));
  game.timeline.addAction(new Action({ execute: function() { console.log('Second'); }}, 4, Action.oneShot));
  game.timeline.addAction(new Action({ execute: function() { console.log('Third'); }}, 5, Action.recurring));
}

game = new Game();
