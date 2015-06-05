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
  /*
   * Currently used Spells
   */
  var Fireball = Spell.createSpell(
    'Fireball',
    [
      new SyllableSequence([
        Syllables.FIRE,
        Syllables.CHI,
        Syllables.NIF
      ], SyllableSequence.ordered),
    ],
`Deal 1 Damage.`,
    function resolve(mage) {
      var damage = 1;
      return new Promise(function(resolve, reject) {
        if(mage.controller === GUI.game.visualizedMainPlayer) {
          console.log('ownMage');
          var targets = game.battlefield.getCharactersMatching(function(character) {
            return true;
          });
          GUI.game.selectTarget = new GUI.SelectTarget(targets, function(target) {
            env.conn.send({
              command: 'targetForDamage',
              targetId: target.id,
              damage: damage
            });
            target.receiveDamage(damage);
            resolve();
          });
        } else {
          console.log('enemyMage');
          resolve();
        }
      });
    }
  );

  var WildPyromancer = Spell.createSpell(
    'Wild Pyromancer',
    [
      new SyllableSequence([
        Syllables.FIRE,
        //Syllables.XAU,
        //Syllables.CHI,
        Syllables.NIF,
      ], SyllableSequence.ordered),
    ],
`3/2 (5) Goblin Shaman Familiar
Battlecry: Cast Fireball.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 2,
          at: 3,
          delay: 5
        }, mage)).putOntoBattlefield();

        resolve();
      });
    }
  );

  var GoblinAttackSquad = Spell.createSpell(
     'Goblin Attack Squad',
     [
       new SyllableSequence([
         Syllables.FIRE,
         //Syllables.XAU,
         //Syllables.CHI,
         //Syllables.REN,
         Syllables.CHI,
       ], SyllableSequence.ordered),
     ],
`Summon 3 1/1 (3) Goblin Familiars.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        _(3).times(function() {
          new Permanent({
            spellTypes: [SpellType.Familiar],
            hp: 1,
            at: 1,
            delay: 3
          }, mage).putOntoBattlefield();
        });

        resolve();
      });
    }
  );

  var RaidLeader = Spell.createSpell(
     'Raid Leader',
     [
       new SyllableSequence([
         Syllables.FIRE,
         Syllables.XAU,
         Syllables.MA,
         Syllables.EX,
       ], SyllableSequence.ordered),
     ],
`1/3 (4) Goblin Familiar
Your other Goblin Familiars enter the battlefield with +1/+1.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 1,
          at: 1,
          delay: 1
        }, mage)).putOntoBattlefield();

        resolve();
      });
    }
  );

  var Brocky = Spell.createSpell(
     `Brocky, Cynthia's Guardian`,
     [
       new SyllableSequence([
         Syllables.EARTH,
         Syllables.GAM,
         Syllables.KUN,
         Syllables.KUN,
         Syllables.XAU,
       ], SyllableSequence.ordered),
     ],
`2/5 (7) Golem Artifact Familiar
[this] receives 1 Damage less in Battle.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 1,
          at: 1,
          delay: 1
        }, mage)).putOntoBattlefield();

        resolve();
       });
    }
  );

  var HealingWave = Spell.createSpell(
     'Healing Wave',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.MA,
         Syllables.EX,
       ], SyllableSequence.ordered),
     ],
`Heal 2 HP of all friendly Characters.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 1,
          at: 1,
          delay: 1
        }, mage)).putOntoBattlefield();

        resolve();
       });
    }
  );

  var SunlitEidolon = Spell.createSpell(
     'Sunlit Eidolon',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.KUN,
         Syllables.MA,
         Syllables.REN,
         Syllables.XAU,
       ], SyllableSequence.ordered),
     ],
`2/X (4) Spirit Enchantment Familiar
Battlecry: X becomes the number of your Light Syllables.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 1,
          at: 1,
          delay: 1
        }, mage)).putOntoBattlefield();

        resolve();
       });
    }
  );

  var LightWeaver = Spell.createSpell(
     'Light Weaver',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.XAU,
         Syllables.MA,
         Syllables.RYO,
       ], SyllableSequence.ordered),
     ],
`1/3 Human Priest Familiar
At the start of your turn: Get 1 SP.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 1,
          at: 1,
          delay: 1
        }, mage)).putOntoBattlefield();

        resolve();
       });
    }
  );

  var AdlezTheSilverFang = Spell.createSpell(
     'Adlez, the Silver Fang',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.GAM,
         Syllables.MA,
         Syllables.XAU,
       ], SyllableSequence.ordered),
     ],
`2/3 (4) Human Knight Familiar
At the start of its turn: Gain 1 AT.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        (new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 1,
          at: 1,
          delay: 1
        }, mage)).putOntoBattlefield();

        resolve();
       });
    }
  );

  var spellBook = new SpellBook();
  [
    Fireball,
    WildPyromancer,
    GoblinAttackSquad,
    RaidLeader,

    Brocky,

    HealingWave,
    SunlitEidolon,
    LightWeaver,
    AdlezTheSilverFang
  ].forEach(spellBook.addSpell.bind(spellBook));
  return spellBook;
};

configureGameForTwoPlayers = function() {
  var players = [new Player(), new Player()];
  var mages = [
    new Mage(
      players[0],
      20,
      30,
      6,
      new SyllableBoard({ x: 8, y: 8 }),
      createTestSpellbook(),
      createStandardSyllablePool()
    ),
    new Mage(
      players[1],
      50,
      10,
      6,
      new SyllableBoard({ x: 7, y: 7 }),
      createTestSpellbook(),
      createStandardSyllablePool()
    )
  ];

/*
  var sampleBoard = mages[0].syllableBoard;
  sampleBoard.placeSyllable({ x: 0, y: 3 }, Syllables.FIRE);
  sampleBoard.placeSyllable({ x: 2, y: 3 }, Syllables.XAU);
  sampleBoard.placeSyllable({ x: 1, y: 3 }, Syllables.CHI);
  sampleBoard.switchSyllables({ x: 2, y: 3 }, { x: 1, y: 3 });
*/

  players.forEach(game.addPlayer.bind(game));

  mages[0].putOntoBattlefield();
  game.timeline.advance();
  game.timeline.advance();
  game.timeline.advance();
  mages[1].putOntoBattlefield();

/*
  (new Permanent({
    spellTypes: [SpellType.Artifact, SpellType.Familiar],
    hp: 5,
    at: 2,
    delay: 4,
    id: nextID()
  }, mages[0])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Familiar],
    hp: 2,
    at: 4,
    delay: 4,
    id: nextID()
  }, mages[0])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Familiar],
    hp: 7,
    at: 1,
    delay: 3,
    id: nextID()
  }, mages[1])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Familiar],
    hp: 8,
    at: 8,
    delay: 8,
    id: nextID()

  }, mages[1])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Familiar],
    hp: 1,
    at: 6,
    delay: 6,
    id: nextID()
  }, mages[1])).putOntoBattlefield();
  */
}

game = new Game();
