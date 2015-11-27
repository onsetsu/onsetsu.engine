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

/*
 * Returns a Promise for an Array of chosen targets.
 */
function selectTarget(targets, minNumTargets, maxNumTargets, special) {
    return new Promise(function(resolve, reject) {
        new GUI.SelectTarget(targets, minNumTargets, maxNumTargets, resolve, special);
    });
}

function ifEnemyResolveElseDo(mage, els) {
    var isEnemy = mage.controller !== GUI.game.visualizedMainPlayer;
    return Promise.resolve(isEnemy ? null : els());
}

var getAllCharacters = function() {
    return game.battlefield.getCharactersMatching(function(character) {
        return true;
    });
};

// TODO: find a convenient way for this kind of checks
const CHECK = {
    IS_PERMANENT: function(character) {
        return character instanceof Permanent;
    }
};

function generateDealDamageToSingleTarget(damage, spellIndex) {
    return function(target) {
        env.conn.send({
            command: 'targetForDamage',
            targetId: target.id,
            damage: damage,
            spellIndex: spellIndex
        });

        return GUI.game.spellBook.spellEntities[spellIndex]
            .drawBattleLine(GUI.game.battlefield.getEntityFor(target), 2)
            .then(function() {
                game.eventManager.execute(EVENT_DEAL_DAMAGE, target, damage);
            });
    }
}

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
    function resolveSpell(mage) {
      var damage = 2;

      return ifEnemyResolveElseDo(mage, function() {
          return selectTarget(getAllCharacters(), 1, 1)
            .spread(generateDealDamageToSingleTarget(damage, Fireball.index));
      });
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
    function resolveSpell(mage) {
      var damage = 2;

      return ifEnemyResolveElseDo(mage, function() {
          return selectTarget(getAllCharacters(), 2, 2)
            .each(generateDealDamageToSingleTarget(damage, ForkedBolt.index))
      });
    }
  );

    var SkyFire = Spell.createSpell(
        'Sky Fire',
        [
            new SyllableSequence([
                //Syllables.FIRE,
                Syllables.CHI,
                Syllables.EX,
                //Syllables.NIF
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target up to 5 Characters: Deal 1 Damage to each.`,
        function resolveSpell(mage) {
            var damage = 1;
            return ifEnemyResolveElseDo(mage, function() {
                return selectTarget(getAllCharacters(), 0, 5)
                    .each(generateDealDamageToSingleTarget(damage, SkyFire.index));
            });
        }
    );

    var FireRain = Spell.createSpell(
    'Fire Rain',
      [
        new SyllableSequence([
          //Syllables.FIRE,
          Syllables.CHI,
          Syllables.REN,
          //Syllables.NIF
        ], SyllableSequence.ordered),
      ],
      `Sorcery
Target 2 to 4 Familiars: Deal 1 Damage to each.`,
      function resolveSpell(mage) {
        var damage = 1;
        return ifEnemyResolveElseDo(mage, function() {
            // TODO: this check is currently used as an IS_FAMILIAR
            return selectTarget(getAllCharacters().filter(CHECK.IS_PERMANENT), 2, 4)
              .each(generateDealDamageToSingleTarget(damage, FireRain.index));
        });
      }
    );

  var HungryDemon = Spell.createSpell(
    'Hungry Demon',
    [
      new SyllableSequence([
        Syllables.SHADOW,
        Syllables.MA,
      ], SyllableSequence.ordered),
    ],
`5/0 (5) Demon Familiar
Choose 2 or more friendly Familiars when you cast/resolve? [this]:
Sacrifice them, [this] gets HP equal to the sum of the sacrified familiars HP.`,
    function resolveSpell(mage) {
      return new Promise(function(resolve, reject) {
        var permanent = new Permanent({
          spellTypes: [SpellType.Familiar],
          subTypes: [SUBTYPE_DEMON],
          hp: 0,
          at: 5,
          delay: 5
        }, mage);
        permanent.index = HungryDemon.index;

        var friendlyFamiliars = getAllCharacters()
            // TODO: this check is currently used as an IS_FAMILIAR
            .filter(CHECK.IS_PERMANENT)
            // TODO: are Familiars of an allied player/mage also friendly Familiars?
            .filter(permanent => permanent.mage === mage);

          selectTarget(friendlyFamiliars, 2, Number.POSITIVE_INFINITY)
              .each(target => {
                  permanent.hp += target.hp;
                  return game.eventManager.execute(EVENT_SACRIFICE, target);
              })
              .then(() => {
                  game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage);
                  resolve();
              });
      });
    }
  );


    var ShieldKnight = Spell.createSpell(
        'Shield Knight',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.KUN,
            ], SyllableSequence.ordered),
        ],
        `3/2 (4) Human Knight Familiar
Battlecry: Target another Familiar: [this] gets additional HP equal to targets HP.`,
        function resolveSpell(mage) {
            return new Promise(function(resolve, reject) {
                var permanent = new Permanent({
                    spellTypes: [SpellType.Familiar],
                    subTypes: [SUBTYPE_HUMAN, SUBTYPE_KNIGHT],
                    hp: 2,
                    at: 3,
                    delay: 4
                }, mage);
                permanent.index = ShieldKnight.index;

                permanent.afterTriggers = [
                    new Trigger(
                        (event, newPermanent, mage, ...args) => {
                            return event === EVENT_ENTER_BATTLEFIELD && newPermanent === permanent
                        },
                        (event, permanent, mage, ...args) => {
                            var otherFamiliars = getAllCharacters()
                                // TODO: this check is currently used as an IS_FAMILIAR
                                .filter(CHECK.IS_PERMANENT)
                                .filter(target => target !== permanent);

                            return selectTarget(otherFamiliars, 1, 1)
                                .spread(target => {
                                    permanent.hp += target.hp;
                                });
                        }
                    )
                ];

                game.eventManager.execute(EVENT_ENTER_BATTLEFIELD, permanent, mage)
                    .then(resolve);
            });
        }
    );

    var Overheat = Spell.createSpell(
        'Overheat',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.TO,
                //Syllables.EX,
                //Syllables.NIF
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target up to 3 Familiars: Deal 3 Damage to each. Loose 1 HP for each beyond the first one.`,
        function resolveSpell(mage) {
            var damage = 3;
            return ifEnemyResolveElseDo(mage, function() {
                // TODO: this check is currently used as an IS_FAMILIAR
                return selectTarget(getAllCharacters().filter(CHECK.IS_PERMANENT), 0, 3)
                    .each(generateDealDamageToSingleTarget(damage, Overheat.index))
                    .then((targets) => {
                        if(targets.length > 1) {
                            // TODO: as EVENT_LOSE_HP
                            mage.hp -= targets.length - 1;
                        }
                    });
            });
        }
    );

    var ChainLightning = Spell.createSpell(
        'Chain Lightning',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.REN,
            ], SyllableSequence.ordered),
        ],
        // TODO: Lightning subtype
        `Lightning Sorcery
Target 3 Characters: Deal 3 Damage to the first target, 2 to the second, and 1 to the third.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var damage = 3;

                return selectTarget(getAllCharacters(), 3, 3)
                    .each(target => {
                        return generateDealDamageToSingleTarget(damage, ChainLightning.index)(target)
                            .then(() => { damage -= 1; })
                    });
            });
        }
    );


    var BreakDownPunch = Spell.createSpell(
        'Break Down Punch',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.NIF,
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target 2 Familiars with different AT:
Deal Damage equal to the difference to all enemy Mages.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                // TODO: this check is currently used as an IS_FAMILIAR
                var familiars = getAllCharacters().filter(CHECK.IS_PERMANENT);
                return selectTarget(familiars, 2, 2, {
                    getSelectibles: function(alreadySelected) {},
                    isValidSelection: function (alreadySelected) {}
                })
                    .spread((target1, target2) => {
                        return generateDealDamageToSingleTarget(Math.abs(target1.at - target2.at), BreakDownPunch.index)(mage);
                    });
            });
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
        function resolveSpell(mage) {
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
    function resolveSpell(mage) {
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
    function resolveSpell(mage) {
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
      function resolveSpell(mage) {
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
    function resolveSpell(mage) {
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
    function resolveSpell(mage) {
      // TODO: use SUBTYPE_LIGHTNING
      var damage = game.battlefield.getCharactersMatching(function(character) {
        return character === mage || character.mage === mage;
      }).length;

      return ifEnemyResolveElseDo(mage, function() {
          return selectTarget(getAllCharacters(), 1, 1)
            .spread(generateDealDamageToSingleTarget(damage, PurgeRay.index));
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
`2/? (4) Spirit Enchantment Familiar
When [this] enters the Battlefield:
Its HP become the number of your Light Syllables.`,
    function resolveSpell(mage) {
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
    function resolveSpell(mage) {
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
    function resolveSpell(mage) {
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
    SkyFire,
    FireRain,
    HungryDemon,
    ShieldKnight,
    Overheat,
    ChainLightning,
    BreakDownPunch,
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
