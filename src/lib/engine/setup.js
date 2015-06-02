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
`Deal 1 Damage.`
  );

  var GreatFireball = Spell.createSpell(
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
`Deal 5 Damage.`
  );

  var MeteorStrike = Spell.createSpell(
     'Meteor Strike',
     [
       new SyllableSequence([
         Syllables.FIRE,
         Syllables.CHI,
         Syllables.NIF,
         Syllables.RYO,
         Syllables.GAM
       ], SyllableSequence.ordered),
     ],
`Delay 5: Deal 4 Damage to a Familiar.`
  );

  var WildPyromancer = Spell.createSpell(
    'Wild Pyromancer',
    [
      new SyllableSequence([
        Syllables.FIRE,
        Syllables.XAU,
        Syllables.CHI,
        Syllables.NIF,
      ], SyllableSequence.ordered),
    ],
`3/2 (5) Goblin Shaman Familiar
Battlecry: Cast Fireball.`,
    function resolve(mage, then) {
      (new Permanent({
        spellTypes: [SpellType.Familiar],
        hp: 2,
        at: 3,
        delay: 5
      }, mage)).putOntoBattlefield();
      then();
    }
  );

  var Melting = Spell.createSpell(
     'Melting',
     [
       new SyllableSequence([
         Syllables.FIRE,
         Syllables.GAM,
         Syllables.CHI,
         Syllables.TO,
         Syllables.RYO,
       ], SyllableSequence.ordered),
     ],
`Delay 4: Destroy target Artifact.`
  );

  var GoblinAttackSquad = Spell.createSpell(
     'Goblin Attack Squad',
     [
       new SyllableSequence([
         Syllables.FIRE,
         Syllables.XAU,
         Syllables.CHI,
         Syllables.REN,
         Syllables.CHI,
       ], SyllableSequence.ordered),
     ],
`Summon 3 1/1 (3) Goblin Familiars.`
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
Your other Goblin Familiars enter the battlefield with +1/+1.`
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
[this] receives 1 Damage less in Battle.`
  );

  var MonumentOfConsecration = Spell.createSpell(
     'Monument of Consecration',
     [
       new SyllableSequence([
         Syllables.EARTH,
         Syllables.LIGHT,
         Syllables.GAM,
         Syllables.MA,
         Syllables.CHI,
       ], SyllableSequence.ordered),
     ],
`Artifact
Your Familiars deal 1 more Damage in Battle.`
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
`Heal 2 HP of all friendly Characters.`
  );

  var LightOfBlessing = Spell.createSpell(
     'Light of Blessing',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.MA,
         Syllables.MA,
       ], SyllableSequence.ordered),
     ],
`Target Familiar gets +1/+1.`
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
Battlecry: X becomes the number of your Light Syllables.`
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
At the start of your turn: Get 1 SP.`
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
`2/3 Human Knight Familiar
At the start of its turn: Gain 1 AT.`
  );

  var ChainLightning = Spell.createSpell(
     'Chain Lightning',
     [
       new SyllableSequence([
         Syllables.LIGHT,
         Syllables.GAM,
         Syllables.CHI,
         Syllables.NIF,
         Syllables.REN,
       ], SyllableSequence.ordered),
     ],
`Deal X Damage to a Familiar. X is the number of your Light Syllables.`
  );

  var KissOfDeath = Spell.createSpell(
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
     'Destroy a Mage.'
  );

  var TurquoiseInferno = Spell.createSpell(
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
     'Massive AoE Damage using the 7th Element.'
  );

  var SwordOfGeminiWings = Spell.createSpell(
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
"If [this] battles an enemy Familiar: reduce its AT by 1."`
  );

  var ElementCurse = Spell.createSpell(
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
You may place a copy of that Syllable.`
  );

  var spellBook = new SpellBook();
  [
    Fireball,
    //MeteorStrike,
    WildPyromancer,
    //Melting,
    GoblinAttackSquad,
    RaidLeader,

    Brocky,
    //MonumentOfConsecration,

    HealingWave,
    SunlitEidolon,
    //LightOfBlessing,
    LightWeaver,
    ChainLightning,
    AdlezTheSilverFang,

    //GreatFireball,

    //KissOfDeath,
    //TurquoiseInferno,
    //SwordOfGeminiWings,
    //ElementCurse,
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

  var sampleBoard = mages[0].syllableBoard;
  sampleBoard.placeSyllable({ x: 0, y: 3 }, Syllables.FIRE);
  sampleBoard.placeSyllable({ x: 2, y: 3 }, Syllables.XAU);
  sampleBoard.placeSyllable({ x: 1, y: 3 }, Syllables.CHI);
  sampleBoard.switchSyllables({ x: 2, y: 3 }, { x: 1, y: 3 });

  players.forEach(game.addPlayer.bind(game));

  mages[0].putOntoBattlefield();
  game.timeline.advance();
  game.timeline.advance();
  game.timeline.advance();
  mages[1].putOntoBattlefield();

  (new Permanent({
    spellTypes: [SpellType.Artifact, SpellType.Familiar],
    hp: 5,
    at: 2,
    delay: 4
  }, mages[0])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Familiar],
    hp: 2,
    at: 4,
    delay: 4
  }, mages[0])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Enchantment, SpellType.Familiar],
    hp: 7,
    at: 1,
    delay: 3
  }, mages[1])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Enchantment],
    delay: 1
  }, mages[1])).putOntoBattlefield();
  (new Permanent({
    spellTypes: [SpellType.Artifact],
    delay: 6
  }, mages[1])).putOntoBattlefield();
}

game = new Game();
