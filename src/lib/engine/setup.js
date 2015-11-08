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

function selectTarget(targets, numTargets) {
    return new Promise(function(resolve, reject) {
        new GUI.SelectTarget(targets, numTargets, ts => resolve(...ts));
    });
}

function ifEnemyResolveElseDo(mage, els) {
    var isEnemy = mage.controller !== GUI.game.visualizedMainPlayer;
    return Promise.resolve(isEnemy ? null : els());
}

// TODO: extract choosing a target(s) and actual dealing damage
// TODO: should look like:
// selectTarget.then(forEachInSeries(dealDamage.bind(undefined, mage, damge)))
var dealDamage = function(mage, damage, spellIndex, numTargets) {
  return ifEnemyResolveElseDo(mage, function() {
    return new Promise(function(resolve, reject) {
      var targets = game.battlefield.getCharactersMatching(function(character) {
        return true;
      });
      selectTarget(targets, numTargets).then(function(target) {
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
    });
  });
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
`Sorcery
Deal 2 Damage.`,
    function resolve(mage) {
      var damage = 2;
      return dealDamage(mage, damage, Fireball.index, 1);
    }
  );

  var ForkedBolt = Spell.createSpell(
    'Forked Bolt',
    [
      new SyllableSequence([
        //Syllables.FIRE,
        Syllables.CHI,
        Syllables.CHI,
        //Syllables.NIF
      ], SyllableSequence.ordered),
    ],
    // TODO: Lightning subtype
    `Lightning Sorcery
Deal 2 Damage to 2 different targets.`,
    function resolve(mage) {
      var damage = 2;
        // TODO: add possibility to damage both chosen targets!!
        // TODO: see selectTarget and dealDamage
      return dealDamage(mage, damage, Fireball.index, 2);
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
          subTypes: [SUBTYPE_GOBLIN, SUBTYPE_SHAMAN],
          hp: 2,
          at: 3,
          delay: 5
        }, mage);
        permanent.index = WildPyromancer.index;
        permanent.afterTriggers = [
            new Trigger(
                (event, newPermanent, mage, ...args) => {
                  return event === EVENT_ENTER_BATTLEFIELD && newPermanent === permanent
                },
                (event, permanent, mage, ...args) => {
                  game.eventManager.execute(EVENT_CAST_SPELL, Fireball, mage);
                }
            )
        ];

        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

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
         Syllables.REN,
       ], SyllableSequence.ordered),
     ],
`Sorcery
Summon 3 1/1 (3) Goblin Familiars.`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        _(3).times(function() {
          var permanent = new Permanent({
            spellTypes: [SpellType.Familiar],
            subTypes: [SUBTYPE_GOBLIN],
            hp: 1,
            at: 1,
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
When a friendly Goblin Familiar enters the battlefield: Give it +1/+1.
(= Your Goblin Familiars enter the battlefield with +1/+1.)`,
    function resolve(mage) {
      return new Promise(function(resolve, reject) {
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          subTypes: [SUBTYPE_OGRE],
          hp: 3,
          at: 3,
          delay: 4
        }, mage);
        permanent.index = RaidLeader.index;
        permanent.afterTriggers = [
          new Trigger(
              (event, newPermanent, itsController, ...args) => {
                return event === EVENT_ENTER_BATTLEFIELD &&
                    newPermanent.subTypes &&
                    newPermanent.subTypes.indexOf(SUBTYPE_GOBLIN) >= 0 &&
                    itsController === permanent.mage
              },
              (event, newPermanent, itsController, ...args) => {
                newPermanent.at++;
                newPermanent.hp++;
                newPermanent.maxHp++;
              }
          )

        ];
        game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);

        resolve();
      });
    }
  );

  var MediumOfFire = Spell.createSpell(
      'Medium of Fire/Elder of Flame',
      [
        new SyllableSequence([
          Syllables.FIRE,
          //Syllables.LIGHT,
          //Syllables.XAU,
          Syllables.YUN,
          //Syllables.CHI,
          //Syllables.NIF,
        ], SyllableSequence.ordered),
      ],
      `2/6 (5) Human Wizard Familiar
When a Spell is casted: Cast Fireball instead.`,
      function resolve(mage) {
        return new Promise(function(resolve, reject) {
          var permanent = new Permanent({
            spellTypes: [SpellType.Familiar],
            subTypes: [SUBTYPE_HUMAN, SUBTYPE_WIZARD],
            hp: 6,
            at: 2,
            delay: 5
          }, mage);
          permanent.index = MediumOfFire.index;
          permanent.replacementEffects = [
            new ReplacementEffect(
                (event, Spell, mage, ...args) => event === EVENT_CAST_SPELL,
                (event, Spell, mage, ...args) => [event, Fireball, mage, ...args]
            )
          ];

          // TODO: Effect: On its turn: you may cast a Fireball.

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
          spellTypes: [SpellType.Artifact, SpellType.Familiar],
          subTypes: [SUBTYPE_GOLEM],
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
`Lightning Sorcery
Deal Damage equal to the number of friendly Characters.`,
    function resolve(mage) {
      // TODO: use SUBTYPE_LIGHTNING
      var damage = game.battlefield.getCharactersMatching(function(character) {
        return character === mage || character.mage === mage;
      }).length;

      return dealDamage(mage, damage, PurgeRay.index, 1);
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
          spellTypes: [SpellType.Enchantment, SpellType.Familiar],
          subTypes: [SUBTYPE_SPIRIT],
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
          subTypes: [SUBTYPE_HUMAN, SUBTYPE_PRIEST],
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
          subTypes: [SUBTYPE_HUMAN, SUBTYPE_KNIGHT],
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
    ForkedBolt,
    WildPyromancer,
    GoblinAttackSquad,
    RaidLeader,

    MediumOfFire,

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
      8, // 0
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
