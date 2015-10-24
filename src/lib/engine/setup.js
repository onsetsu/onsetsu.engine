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

var dealDamage = function(mage, damage, spellIndex) {
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
          damage: damage,
          spellIndex: spellIndex
        });
        GUI.game.spellBook.spellEntities[spellIndex]
          .drawBattleLine(GUI.game.battlefield.getEntityFor(target), 2)
          .then(function() {
            game.eventManager.execute(EVENT_DEAL_DAMAGE, target, damage);
            resolve();
          });
      });
     } else {
      console.log('enemyMage');
      resolve();
    }
  });
};

var pushOnStack = function(ConcreteSpellClass, mage) {
  var spell = new ConcreteSpellClass();
  spell.mage = mage;
  game.stack.push(spell);
};

var orgeCount = function(mage) {
  var ogres = game.battlefield.getCharactersMatching(function(character) {
    return character.mage === mage && character.isOgre;
  });
  return ogres.length;
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
        //Syllables.CHI,
        //Syllables.NIF
      ], SyllableSequence.ordered),
    ],
`Deal 2 Damage.`,
    function resolve(mage) {
      var damage = 2;
      return dealDamage(mage, damage, Fireball.index);
    }
  );

  var WildPyromancer = Spell.createSpell(
    'Wild Pyromancer',
    [
      new SyllableSequence([
        Syllables.FIRE,
        Syllables.XAU,
        Syllables.CHI,
        Syllables.CHI,
        Syllables.NIF,
      ], SyllableSequence.ordered),
    ],
`3/2 (5) Goblin Shaman Familiar
When [this] enters the Battlefield: Cast Fireball.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 2 + orgeCount(mage),
          at: 3 + orgeCount(mage),
          delay: 5
        }, mage);
        permanent.index = WildPyromancer.index;
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

        pushOnStack(Fireball, mage);
        resolve();
      });
    }
  );

  var GoblinAttackSquad = Spell.createSpell(
     'Goblin Attack Squad',
     [
       new SyllableSequence([
         Syllables.FIRE,
         Syllables.XAU,
         Syllables.CHI,
         Syllables.REN,
         Syllables.REN,
       ], SyllableSequence.ordered),
     ],
`Summon 3 1/1 (3) Goblin Familiars.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        _(3).times(function() {
          var permanent = new Permanent({
            spellTypes: [SpellType.Familiar],
            hp: 1 + orgeCount(mage),
            at: 1 + orgeCount(mage),
            delay: 3
          }, mage);
          permanent.index = GoblinAttackSquad.index;
          game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);
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
         //Syllables.XAU,
         Syllables.MA,
         //Syllables.EX,
       ], SyllableSequence.ordered),
     ],
`3/3 (4) Ogre Familiar
Your Goblin Familiars enter the battlefield with +1/+1.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 3,
          at: 3,
          delay: 4
        }, mage);
        permanent.index = RaidLeader.index;
        permanent.isOgre = true;
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

        resolve();
      });
    }
  );

  var Brocky = Spell.createSpell(
     `Brocky, Cynthia's Guardian`,
     [
       new SyllableSequence([
         Syllables.EARTH,
         //Syllables.GAM,
         //Syllables.KUN,
         //Syllables.KUN,
         //Syllables.XAU,

           Syllables.MA
       ], SyllableSequence.ordered),
     ],
`2/5 (7) Golem Artifact Familiar
Reduce Damage [this] receives by 1.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var brocky = new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 5,
          at: 2,
          delay: 7
        }, mage);
        brocky.index = Brocky.index;
        brocky.replacementEffects = [
          new ReplacementEffect(
              (event, target) => event === EVENT_DEAL_DAMAGE && target === brocky,
              (event, target, amount, ...args) => [event, target.mage, amount, ...args]
          ),
          new ReplacementEffect(
              (event, target) => event === EVENT_DEAL_DAMAGE && target === brocky,
              (event, target, amount, ...args) => [event, target, amount-1, ...args]
          ),
          new ReplacementEffect(
              (event, target) => event === EVENT_DEAL_DAMAGE && target === brocky,
              (event, target, amount, ...args) => [event, target, amount-1, ...args]
          ),
        ];
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, brocky, mage);
        resolve();
       });
    }
  );

  var PurgeRay = Spell.createSpell(
     'Purge Ray',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.CHI,
         Syllables.REN,
         Syllables.NIF,
       ], SyllableSequence.ordered),
     ],
`Deal Damage equal to the number of friendly Characters.`,
    function resolve(mage) {
      var damage = game.battlefield.getCharactersMatching(function(character) {
        return character === mage || character.mage === mage;
      }).length;

      return dealDamage(mage, damage, PurgeRay.index);
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
`2/? (4) Spirit Enchantment Familiar
When [this] enters the Battlefield:
Its HP become the number of your Light Syllables.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var lightSyllableCount = 0;
        mage.syllableBoard.syllableStones.forEach(function(row) {
          row.forEach(function(stone) {
            if(stone &&
                stone.syllable &&
                stone.syllable.isA &&
                stone.syllable.isA(Syllables.LIGHT)
            ) {
              lightSyllableCount += 1;
            }
          })
        });
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: lightSyllableCount,
          at: 2,
          delay: 4
        }, mage);
        permanent.index = SunlitEidolon.index;
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

        resolve();
       });
    }
  );

  var LightWeaver = Spell.createSpell(
     'Light Weaver',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         //Syllables.XAU,
         Syllables.MA,
         //Syllables.RYO,
       ], SyllableSequence.ordered),
     ],
`1/3 (5) Human Priest Familiar
At the start of your turn: Get 1 SP.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 3,
          at: 1,
          delay: 5
        }, mage);
        permanent.index = LightWeaver.index;
        permanent.afterTriggers = [
          new Trigger(
              (event, ...args) => { return event === EVENT_START_TURN && args[0] === permanent.mage},
              (event, ...args) => { args[0].sp += 1; }
          )
        ];
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

        resolve();
       });
    }
  );

  var AdlezTheSilverFang = Spell.createSpell(
     'Adlez, the Silver Fang',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         //Syllables.GAM,
         Syllables.MA,
         //Syllables.XAU,
       ], SyllableSequence.ordered),
     ],
`2/3 (4) Human Knight Familiar
At the start of its turn: Gain 1 AT.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          hp: 3,
          at: 2,
          delay: 4
        }, mage);
        permanent.index = AdlezTheSilverFang.index;
        permanent.afterTriggers = [
          new Trigger(
              (event, ...args) => { return event === EVENT_START_TURN && args[0] === permanent},
              event => { permanent.at++; }
          )
        ];
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

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

    PurgeRay,
    SunlitEidolon,
    LightWeaver,
    AdlezTheSilverFang
  ].forEach(spellBook.addSpell.bind(spellBook));
  spellBook.spells.forEach(function(spellClass, index) {
    spellClass.index = index;
  });
  return spellBook;
};

configureGameForTwoPlayers = function() {
  var players = [new Player(), new Player()];
  var mages = [
    new Mage(
      players[0],
      20,
      0,
      6,
      new SyllableBoard({ x: 8, y: 8 }),
      createTestSpellbook(),
      createStandardSyllablePool()
    ),
    new Mage(
      players[1],
      20,
      0,
      6,
      new SyllableBoard({ x: 8, y: 8 }),
      createTestSpellbook(),
      createStandardSyllablePool()
    )
  ];

  players.forEach(game.addPlayer.bind(game));

  mages[0].putOntoBattlefield();
  game.timeline.advance();
  game.timeline.advance();
  game.timeline.advance();
  mages[1].putOntoBattlefield();
};

game = new Game();
