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
function selectTarget(getSelectibles, isValidSelection, parameters) {
    return new Promise(function(resolve, reject) {
        new GUI.SelectTarget(resolve, getSelectibles, isValidSelection, parameters);
    });
}

function selectNumberOfUniqueTargets(targets, minNumTargets, maxNumTargets, parameters) {
    function getSelectibles(alreadySelected) {
        if(alreadySelected.length >= maxNumTargets) {
            return [];
        }
        return _.difference(targets, alreadySelected);
    }

    function isValidSelection(alreadySelected) {
        return alreadySelected.length >= minNumTargets &&
            alreadySelected.length <= maxNumTargets &&
            alreadySelected.length === _.uniq(alreadySelected).length;
    }

    return selectTarget(getSelectibles, isValidSelection, parameters);
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

class InfoMessage {
    constructor(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
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
            var infoMessage = new InfoMessage('Fireball: Select a target.');

            return ifEnemyResolveElseDo(mage, function() {
                return selectNumberOfUniqueTargets(getAllCharacters(), 1, 1, {
                    infoMessage: infoMessage
                })
                    .spread(generateDealDamageToSingleTarget(damage, Fireball.index));
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
                    creatingSpell: WildPyromancer,
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
                Syllables.EARTH,
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
                        creatingSpell: GoblinAttackSquad,
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
                    creatingSpell: RaidLeader,
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
                    creatingSpell: MediumOfFire,
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

    var FirePillars = Spell.createSpell(
        'Fire Pillars',
        [
            new SyllableSequence([
                Syllables.EARTH,
                Syllables.REN,
                Syllables.REN
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target any number of familiars. Deal 3 Damage to each.`,
        function resolveSpell(mage) {
            var damage = 3;
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Fire Pillars: Select any number of targets.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                return selectNumberOfUniqueTargets(allTargets, 0, Number.POSITIVE_INFINITY, {
                    infoMessage: infoMessage
                })
                    .each(generateDealDamageToSingleTarget(damage, FirePillars.index));
            });
        }
    );

    var ImpulseSalvo = Spell.createSpell(
        'Impulse Salvo',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.REN,
                Syllables.CHI
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target 3 Familiars: Deal 1 damage to the first target,
2 damage to the second target, and 3 damage to the third target.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Impulse Salvo: Select 3 targets.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                return ifEnemyResolveElseDo(mage, () => selectNumberOfUniqueTargets(allTargets, 3, 3, {
                        infoMessage: infoMessage
                    })
                    .each((target, index) => generateDealDamageToSingleTarget(index + 1, ImpulseSalvo.index)(target))
                );
            });
        }
    );

    var ShatteredGrowth = Spell.createSpell(
        'Shattered Growth',
        [
            new SyllableSequence([
                Syllables.EARTH,
                Syllables.REN,
                Syllables.MA
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target 5 Familiars. Each target gets +1/+1.
You may choose the same target multiple times.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Shattered Growth: Select 5 Targets.\nYou may choose the same target multiple times.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 5) {
                        return [];
                    } else {
                        return allTargets;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 5;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    multiTargeting: true,
                    infoMessage: infoMessage
                })
                    .each(familiar => {
                        familiar.at++;
                        familiar.hp++;
                    });
            });
        }
    );

    var RockSlide = Spell.createSpell(
        'Rock Slide',
        [
            new SyllableSequence([
                Syllables.EARTH,
                Syllables.CHI,
                Syllables.KUN
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target 4 Familiars. Deal 2 Damage to each target.
You may choose the same target up to two times.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Rock Slide: Select 4 targets.\nYou may choose the same target up to two times.');

                var damage = 2;

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 4) {
                        return [];
                    } else {
                        return allTargets.filter(target => {
                            return alreadySelected.filter(selected => selected === target).length <= 1;
                        });
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 4;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    multiTargeting: true,
                    infoMessage: infoMessage
                })
                    .each(target => {
                        // TODO: should move this check into the DEAL_DAMAGE event itself
                        if(!target.isOnBattlefield()) { return; }
                        return generateDealDamageToSingleTarget(damage, RockSlide.index)(target);
                    });
            });
        }
    );

    function doDistributionOncePerUniqueTarget(targets, callback) {
        // TODO: overly complicated logic due to incompatibility of promises, maps and underscore
        var targetCountMapping = new Map();
        targets.forEach((target) => {
            if(targetCountMapping.has(target)) {
                targetCountMapping.set(target, targetCountMapping.get(target) + 1);
            } else {
                targetCountMapping.set(target, 1);
            }
        });

        return Promise.resolve(_.unique(targets))
            .each(target => callback(target, targetCountMapping.get(target)));
    }


    var RagingFlames = Spell.createSpell(
        'Raging Flames',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.REN,
                // TODO: KUN has incorrect flavor
                Syllables.KUN
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Distribute 3 Damage amoung Familiars or Mages`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Raging Flames: Distribute 3 Damage.');

                // TODO: get only mages and familiars
                var allTargets = getAllCharacters();

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 3) {
                        return [];
                    } else {
                        return allTargets;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 3;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    multiTargeting: true,
                    showOnlyTargetQuantity: true,
                    infoMessage: infoMessage
                })
                    .then(targets => doDistributionOncePerUniqueTarget(targets, (target, count) => {
                        return generateDealDamageToSingleTarget(count, RockSlide.index)(target);
                    }));
            });
        }
    );

    var Cultivate = Spell.createSpell(
        'Cultivate',
        [
            new SyllableSequence([
                Syllables.EARTH,
                Syllables.PAI,
                Syllables.REN
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Distribute X +1/+1 counters among up to 3 familiars.
X is the number of friendly characters.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                // TODO: duplicated logic
                function friendlyCharacter(character) {
                    return character === mage || character.mage === mage;
                }

                var numberOfCountersToDistribute = getAllCharacters().filter(friendlyCharacter).length;
                var infoMessage = new InfoMessage('Raging Flames: Distribute ' + numberOfCountersToDistribute + ' counter(s).');

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= numberOfCountersToDistribute) {
                        return [];
                    } else if(_(alreadySelected).unique().length >= 3) {
                        return _(alreadySelected).unique();
                    } else {
                        return allTargets;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === numberOfCountersToDistribute &&
                        _(alreadySelected).unique().length <= 3;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    multiTargeting: true,
                    showOnlyTargetQuantity: true,
                    infoMessage: infoMessage
                })
                    .then(familiars => doDistributionOncePerUniqueTarget(familiars, (familiar, count) => {
                        // TODO: do not forget this when unifying Counter distribution
                        familiar.at += count;
                        familiar.hp += count;
                    }));
            });
        }
    );

    var GeneModification = Spell.createSpell(
        'Gene Modification',
        [
            new SyllableSequence([
                Syllables.WATER,
                Syllables.MA,
                Syllables.MA
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target 2 to 5 Familiars. Each target gets +1/-1. You may choose the same target up to 3 times.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Gene Modification: Select 2 to 5 targets.\nYou may choose the same target up to 3 times.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                function numberOfOccurences(array, item) {
                    return array.filter(i => i === item).length;
                }
                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 5) {
                        return [];
                    } else {
                        return allTargets.filter(target => numberOfOccurences(alreadySelected, target) <= 2);
                    }
                }

                function isValidSelection(alreadySelected) {
                    return 2 <= alreadySelected.length &&
                        alreadySelected.length <= 5 &&
                        alreadySelected.every(target => {
                            return numberOfOccurences(alreadySelected, target) <= 3;
                        });
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    multiTargeting: true,
                    infoMessage: infoMessage
                })
                    .each(familiar => {
                        familiar.at++;
                        familiar.hp--;
                    });
            });
        }
    );

    var ChainBuff = Spell.createSpell(
        'Chain Buff',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.PAI,
                Syllables.REN,
                Syllables.MA
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target 4 Familiars.
The first target gets +1/+1, the second target gets +2/+2, etc.
You may choose the same target multiple times.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Chain Buff: Select 4 targets.\nYou may choose the same target multiple times.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var allTargets = getAllCharacters()
                    .filter(isFamiliar);

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 4) {
                        return [];
                    } else {
                        return allTargets;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 4;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    multiTargeting: true,
                    infoMessage: infoMessage
                })
                    .then(targets => {
                        var x = 1;

                        return Promise.resolve(targets)
                            .each(familiar => {
                                // TODO: do not forget this when unifying +X/+X distribution
                                familiar.at += x;
                                familiar.hp += x;
                                x++;
                            });
                    });

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
                    creatingSpell: Brocky,
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

    var Roast = Spell.createSpell(
        'Roast',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.MA,
                Syllables.TO
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target a Goblin and a Fire Familiar.
Sacrifice both: Get HP equal to the sum of their HP.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Roast: Select a goblin and a fire familiar.');

                // TODO: duplicated check
                function isGoblin(character) {
                    return character.subTypes && _(character.subTypes).contains(SUBTYPE_GOBLIN);
                }

                // TODO: replace with a proper check on .elements property (elements could be modified once a permanent is on field)
                function isFire(character) {
                    var syllableSequence = character.creatingSpell.getBaseSequences()[0];
                    return _.any(syllableSequence.getSyllables(), syllable => syllable.isA(Syllables.FIRE));
                }

                var allTargets = getAllCharacters()
                // TODO: this check is currently used as an IS_FAMILIAR
                    .filter(CHECK.IS_PERMANENT)
                    // TODO: are Familiars of an allied player/mage also friendly Familiars?
                    .filter(permanent => permanent.mage === mage)
                    .filter(familiar => isGoblin(familiar) || isFire(familiar));

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 2) {
                        return [];
                    } else if(alreadySelected.length === 1) {
                        let firstTarget = alreadySelected[0];
                        if(isGoblin(firstTarget) && isFire(firstTarget)) {
                            return allTargets.filter(target => target !== firstTarget);
                        }
                        return allTargets
                            .filter(isGoblin(firstTarget) ? isFire : isGoblin);
                    } else {
                        return allTargets;
                    }
                }

                function implies(a, b) {
                    return (a && b) || !a;
                }
                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 2 &&
                        implies(!isFire(alreadySelected[0]), isFire(alreadySelected[1])) &&
                        implies(!isGoblin(alreadySelected[0]), isGoblin(alreadySelected[1]));
                }

                return (function() {
                    var sum = 0;
                    return selectTarget(getSelectibles, isValidSelection, {
                        infoMessage: infoMessage
                    })
                        .each(target => {
                            sum += target.hp;
                            return game.eventManager.execute(EVENT_SACRIFICE, target);
                        })
                        .then(() => {
                            mage.hp += sum;
                        });
                })();
            });
        }
    );

    var Enrage = Spell.createSpell(
        'Enrage',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.RYO,
                Syllables.MA
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target Goblins with combined AT of 6 or less: Each target gets +1/+1.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Enrage: Select goblins with a combined AT of 6 or less.');

                // TODO: duplicated check
                function isGoblin(character) {
                    return character.subTypes && _(character.subTypes).contains(SUBTYPE_GOBLIN);
                }

                var allTargets = getAllCharacters()
                // TODO: this check is currently used as an IS_FAMILIAR
                    .filter(CHECK.IS_PERMANENT)
                    .filter(isGoblin);

                function getSumOfATs(targets) {
                    return targets.reduce((acc, target) => acc + target.at, 0);
                }

                function getSelectibles(alreadySelected) {
                    var sumOfATs = getSumOfATs(alreadySelected);
                    return _.difference(allTargets, alreadySelected)
                        .filter(target => 6 >= sumOfATs + target.at);
                }

                function isValidSelection(alreadySelected) {
                    return 6 >= getSumOfATs(alreadySelected);
                }

                // TODO: automatically accept selection only if the sum of ATs is exactly 6.

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .each(target => {
                        // TODO: as EVENT_GAIN_AT
                        target.at += 1;
                        // TODO: as EVENT_GAIN_HP
                        target.hp += 1;
                    });
            });
        }
    );

    var BrothersInArms = Spell.createSpell(
        'Brothers in Arms ',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.MA,
                Syllables.REN
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target two or more Familiars with the same AT: Their AT becomes doubled.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Brothers in Arms: Select 2 targets with the same AT.');

                // TODO: duplicated check
                function isGoblin(character) {
                    return character.subTypes && _(character.subTypes).contains(SUBTYPE_GOBLIN);
                }

                // TODO: this check is currently used as an IS_FAMILIAR
                var allFamiliars = getAllCharacters().filter(CHECK.IS_PERMANENT),
                    groups = _.groupBy(allFamiliars, familiar => familiar.at),
                    largeGroups = _.filter(groups, group => group.length >= 2),
                    allTargets = _.flatten(largeGroups, true);

                function getSumOfATs(targets) {
                    return targets.reduce((acc, target) => acc + target.at, 0);
                }

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 1) {
                        return _.difference(allTargets, alreadySelected)
                            .filter(target => target.at === alreadySelected[0].at);
                    }
                    return allTargets;
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length >= 2 &&
                        alreadySelected.every(target => target.at === alreadySelected[0].at);
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .each(target => {
                        // TODO: apply as AT modifier
                        target.at *= 2;
                    });
            });
        }
    );

    var RaiseStruggle = Spell.createSpell(
        'Raise Struggle  ',
        [
            new SyllableSequence([
                Syllables.SHADOW,
                Syllables.CHI
            ], SyllableSequence.ordered),
        ],
        `Sorcery:
Target a number of friendly Familiars and a number of enemy Familiars with the same sum of HP:
Deal 2 Damage to each target.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Raise Struggle: Select friendly and enemy characters with the same sum of HP.');

                // TODO: duplicated check: put into CHECK.IS_FRIENDLY(mage)(character)
                function isFriendly(character) { return character === mage || character.mage === mage}
                var isEnemy = character => !isFriendly(character);
                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var familiars = getAllCharacters().filter(isFamiliar),
                    friendlyFamiliars = familiars.filter(isFriendly),
                    enemyFamiliars = familiars.filter(isEnemy);

                function getSumOfHP(familiars) {
                    return familiars.reduce(function(acc, familiar) {
                        return acc + familiar.hp;
                    }, 0);
                }

                function getSelectibles(alreadySelected) {
                    var selectedFriendlyFamiliars = alreadySelected.filter(isFriendly),
                        selectedEnemyFamiliars = alreadySelected.filter(isEnemy),
                        currentSumOfHPSelectedFriendlyFamiliars = getSumOfHP(selectedFriendlyFamiliars),
                        currentSumOfHPSelectedEnemyFamiliars = getSumOfHP(selectedEnemyFamiliars),
                    // TODO: power operator returns [undefined] on empty arrays, but map to identity solves the issue!?
                        powerSetOfMissingFriendlyFamiliars = Combinatorics.power(_.difference(friendlyFamiliars, selectedFriendlyFamiliars)).map(a=>a),
                        powerSetOfMissingEnemyFamiliars = Combinatorics.power(_.difference(enemyFamiliars, selectedEnemyFamiliars)).map(a=>a),
                        sumsOfMissingFriendlyFamiliars = powerSetOfMissingFriendlyFamiliars.map(getSumOfHP),
                        sumsOfMissingEnemyFamiliars = powerSetOfMissingEnemyFamiliars.map(getSumOfHP);

                    // one has to map 'friendly' and 'enemy' to 'own' and 'opposing' here
                    function filterForMatchingSubgroups(
                        powerSetOfMissingOwnFamiliars,
                        sumsOfMissingOpposingFamiliars,
                        currentSumOfHPSelectedOpposingFamiliars,
                        currentSumOfHPSelectedOwnFamiliars
                    ) {
                        // filter subsets that do not have a matching group on the other side
                        return powerSetOfMissingOwnFamiliars.filter(ownFamiliarSubset => {
                            var sumOfHPOwnFamiliarSubset = getSumOfHP(ownFamiliarSubset);
                            return sumsOfMissingOpposingFamiliars.some(sumOfOpposingSubset => {
                                // take sum of HPs of currently selected familiars into account
                                return sumOfOpposingSubset + currentSumOfHPSelectedOpposingFamiliars ===
                                    sumOfHPOwnFamiliarSubset + currentSumOfHPSelectedOwnFamiliars;
                            });
                        });
                    }
                    var filteredPowerSetOfMissingFriendlyFamiliars = filterForMatchingSubgroups(
                        powerSetOfMissingFriendlyFamiliars,
                        sumsOfMissingEnemyFamiliars,
                        currentSumOfHPSelectedEnemyFamiliars,
                        currentSumOfHPSelectedFriendlyFamiliars
                    );
                    var filteredPowerSetOfMissingEnemyFamiliars = filterForMatchingSubgroups(
                        powerSetOfMissingEnemyFamiliars,
                        sumsOfMissingFriendlyFamiliars,
                        currentSumOfHPSelectedFriendlyFamiliars,
                        currentSumOfHPSelectedEnemyFamiliars
                    );

                    var flattenedPowerSetOfMissingFriendlyFamiliars = _.flatten(filteredPowerSetOfMissingFriendlyFamiliars, true),
                        flattenedPowerSetOfMissingEnemyFamiliars = _.flatten(filteredPowerSetOfMissingEnemyFamiliars, true),
                        uniqueSetOfMissingFriendlyFamiliars = _.unique(flattenedPowerSetOfMissingFriendlyFamiliars),
                        uniqueSetOfMissingEnemyFamiliars = _.unique(flattenedPowerSetOfMissingEnemyFamiliars);

                    return uniqueSetOfMissingFriendlyFamiliars.concat(uniqueSetOfMissingEnemyFamiliars);
                }

                function isValidSelection(alreadySelected) {
                    var selectedFriendlyFamiliars = alreadySelected.filter(isFriendly),
                        selectedEnemyFamiliars = alreadySelected.filter(isEnemy);

                    return getSumOfHP(selectedFriendlyFamiliars) === getSumOfHP(selectedEnemyFamiliars);
                }

                var damage = 2;
                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .each(generateDealDamageToSingleTarget(damage, RaiseStruggle.index));
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
            var infoMessage = new InfoMessage('Forked Bolt: Select 2 targets.');

            var damage = 2;

            return ifEnemyResolveElseDo(mage, function() {
                return selectNumberOfUniqueTargets(getAllCharacters(), 2, 2, {
                    infoMessage: infoMessage
                })
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
            var infoMessage = new InfoMessage('Sky Fire: Select up to 5 targets.');

            var damage = 1;
            return ifEnemyResolveElseDo(mage, function() {
                return selectNumberOfUniqueTargets(getAllCharacters(), 0, 5, {
                    infoMessage: infoMessage
                })
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
            var infoMessage = new InfoMessage('Fire Rain: Select 2 to 4 targets.');

            var damage = 1;
            return ifEnemyResolveElseDo(mage, function() {
                // TODO: this check is currently used as an IS_FAMILIAR
                return selectNumberOfUniqueTargets(getAllCharacters().filter(CHECK.IS_PERMANENT), 2, 4, {
                    infoMessage: infoMessage
                })
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
                var infoMessage = new InfoMessage('Hungry Demon: Select 2 or more targets.');

                var permanent = new Permanent({
                    creatingSpell: HungryDemon,
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

                selectNumberOfUniqueTargets(friendlyFamiliars, 2, Number.POSITIVE_INFINITY, {
                    infoMessage: infoMessage
                })
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
                var infoMessage = new InfoMessage('Shield Knight: Select a target.');

                var permanent = new Permanent({
                    creatingSpell: ShieldKnight,
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
                                // TODO: extract as IS_NOT(identity)
                                .filter(target => target !== permanent);

                            return selectNumberOfUniqueTargets(otherFamiliars, 1, 1, {
                                infoMessage: infoMessage
                            })
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
            var infoMessage = new InfoMessage('Overheat: Select up to 3 targets.');

            var damage = 3;
            return ifEnemyResolveElseDo(mage, function() {
                // TODO: this check is currently used as an IS_FAMILIAR
                return selectNumberOfUniqueTargets(getAllCharacters().filter(CHECK.IS_PERMANENT), 0, 3, {
                    infoMessage: infoMessage
                })
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
                var infoMessage = new InfoMessage('Chain Lightning: Select 3 targets.');

                var damage = 3;

                return selectNumberOfUniqueTargets(getAllCharacters(), 3, 3, {
                    infoMessage: infoMessage
                })
                    .each(target => {
                        return generateDealDamageToSingleTarget(damage, ChainLightning.index)(target)
                            .then(() => { damage -= 1; })
                    });
            });
        }
    );

    var SymphonyOfTheBoundSoul = Spell.createSpell(
        'Symphony of the Bound Soul',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.MA,
                Syllables.MA
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target a mage and a familiar he/she controls: Both gain 2 HP.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Symphony of the Bound Soul: Select a familiar and its controller.');

                var damage = 2;

                // TODO: !CHECK:IS_PERMANENT is not the correct check for a mage
                function isMage(character) { return !CHECK.IS_PERMANENT(character)}
                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                // TODO: duplicated check: put into CHECK.IS_FRIENDLY(mage)(character)
                function isFriendly(character) { return character === mage || character.mage === mage}
                var isEnemy = character => !isFriendly(character);

                var numFriendlyFamiliars = getAllCharacters().filter(isFamiliar).filter(isFriendly).length,
                    numEnemyFamiliars = getAllCharacters().filter(isFamiliar).filter(isEnemy).length;

                var allTargets = (numFriendlyFamiliars >= 1 ? getAllCharacters().filter(isFriendly) : []).concat(
                    numEnemyFamiliars >= 1 ? getAllCharacters().filter(isEnemy) : []
                );

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 2) {
                        return [];
                    } else if(alreadySelected.length === 1) {
                        return allTargets
                            .filter(isFriendly(alreadySelected[0]) ? isFriendly : isEnemy)
                            .filter(isMage(alreadySelected[0]) ? isFamiliar : isMage);
                    } else {
                        return allTargets;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 2 &&
                        isFriendly(alreadySelected[0]) === isFriendly(alreadySelected[1]) && (
                            (isMage(alreadySelected[0]) && isFamiliar(alreadySelected[1])) ||
                            (isFamiliar(alreadySelected[0]) && isMage(alreadySelected[1]))
                        );
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                // TODO: as EVENT_GAIN_HP
                    .each(target => target.hp += 2);
            });
        }
    );

    var FlameThrower = Spell.createSpell(
        'Flame Thrower',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.PAI,
                Syllables.NIF
            ], SyllableSequence.ordered),
        ],
        // TODO: currently, no dragon is availabe, so we use sunlit eidolon instead
        `Sorcery
Target a Dragon or 2 FIRE Familiars (currently: target a Spirit or 2 LIGHT):
Deal Damage equal to the sum of their AT to all enemy Mages.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Flame Thrower: Select a dragon or 2 fire familiars.\nCurrently: Select a spirit or 2 light familiars.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;
                function isSpirit(character) {
                    return character.subTypes && _(character.subTypes).contains(SUBTYPE_SPIRIT);
                }

                // TODO: This is horrible;
                // TODO: permanents need to know their (concrete) summon spell
                // TODO: not just check for first Syllable, what about multi-element spells?
                // -> create Facility for checking a spell elements
                function isLight(character) {
                    // mages have no .index property currently
                    if(!_.isNumber(character.index)) { return false; }

                    var characterSpell = mage.spellBook.spells[character.index],
                        firstSyllable = characterSpell.getBaseSequence(0).syllables[0];

                    return firstSyllable.isA(Syllables.LIGHT);
                }

                var allTargets = getAllCharacters()
                    .filter(character => isSpirit(character) || isLight(character));

                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 2) {
                        return [];
                    } else if(alreadySelected.length === 1) {
                        if(isLight(alreadySelected[0])) {
                            return allTargets
                                .filter(isLight)
                                .filter(target => !_(alreadySelected).contains(target))
                        } else {
                            // non-Light Spirit selected:
                            return [];
                        }
                    } else {
                        return allTargets;
                    }
                }

                function isValidSelection(alreadySelected) {
                    var twoLightFamiliars = alreadySelected.length === 2 && alreadySelected.every(isLight);
                    var singleSpiritFamiliar = alreadySelected.length === 1 && isSpirit(alreadySelected[0]);

                    return twoLightFamiliars || singleSpiritFamiliar;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .reduce((sumOfATs, target) => sumOfATs + target.at, 0)
                    .then(sumOfATs => {
                        // TODO: currently damages own mage, not opponents
                        return generateDealDamageToSingleTarget(sumOfATs, FlameThrower.index)(mage);
                    });
            });
        }
    );


    var GoblinBombardment = Spell.createSpell(
        'Goblin Bombardment',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.REN,
                Syllables.NIF
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target an enemy character and one or more friendly Goblin Familiars.
Deal 1 Damage to each Goblin and Damage to target enemy equal to each Goblins AT.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Goblin Bombardment: Select an enemy and at least one friendly goblin.');

                var damage = 1;
                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;
                // TODO: duplicated check
                function isGoblin(character) {
                    return character.subTypes && _(character.subTypes).contains(SUBTYPE_GOBLIN);
                }

                // TODO: duplicated check: put into CHECK.IS_FRIENDLY(mage)(character)
                function isFriendly(character) { return character === mage || character.mage === mage}
                var isEnemy = character => !isFriendly(character);

                function filterForFriendlyGoblinFamiliars(baseSet) {
                    return baseSet
                        .filter(isFriendly)
                        .filter(isFamiliar)
                        .filter(isGoblin);
                }

                var friendlyGoblinFamiliars = filterForFriendlyGoblinFamiliars(getAllCharacters());
                var allTargets = getAllCharacters()
                    .filter(isEnemy)
                    .concat(friendlyGoblinFamiliars);

                function getSelectibles(alreadySelected) {
                    var possibleTargets = allTargets;

                    // is enemy character already selected?
                    if(alreadySelected.filter(isEnemy).length >= 1) {
                        possibleTargets = friendlyGoblinFamiliars;
                    }

                    // without already selected targets
                    return possibleTargets.filter(target => {
                        return !_(alreadySelected).contains(target);
                    });
                }

                function isValidSelection(alreadySelected) {
                    if(alreadySelected.length <= 1) { return false; }

                    var enemyCharacters = alreadySelected.filter(isEnemy);
                    var goblins = filterForFriendlyGoblinFamiliars(alreadySelected);

                    return enemyCharacters.length === 1 &&
                        goblins.length >= 1 &&
                        goblins.length + enemyCharacters.length === alreadySelected.length;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .then(targets => {
                        var enemy = targets.find(isEnemy);

                        return Promise.resolve(targets.filter(target => target !== enemy))
                            .each(goblin => {
                                return generateDealDamageToSingleTarget(damage, GoblinBombardment.index)(goblin)
                                    .then(() => {
                                        // TODO: should the enemy not be removed from battlefield even though
                                        // it has 0 or less HP?
                                        if(!enemy.onBattlefield) { return; }
                                        return generateDealDamageToSingleTarget(goblin.at, GoblinBombardment.index)(enemy)
                                    });
                            })
                    });
            });
        }
    );

    var BlessingAndCurse = Spell.createSpell(
        'Blessing and Curse',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.SHADOW,
                Syllables.REN
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target 3 Characters: Deal 2 Damage to each enemy target and all friendly Targets get 2 HP.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Blessing and Curse: Select 3 targets.');

                var damageAndHPGain = 2;

                // TODO: duplicated check: put into CHECK.IS_FRIENDLY(mage)(character)
                function isFriendly(character) { return character === mage || character.mage === mage}

                return selectNumberOfUniqueTargets(getAllCharacters(), 3, 3, {
                    infoMessage: infoMessage
                })
                    .each(target => {
                        if(isFriendly(target)) {
                            // TODO: EVENT_GAIN HP
                            target.hp += damageAndHPGain;
                        } else {
                            return generateDealDamageToSingleTarget(damageAndHPGain, BlessingAndCurse.index)(target);
                        }
                    });
            });
        }
    );

    var FerociousAssault = Spell.createSpell(
        'Ferocious Assault',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.REN,
                Syllables.CHI
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target an equal number of friendly and enemy characters: Deal 2 Damage to each.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Ferocious Assault: Select an equal number of friendly and enemy targets.');

                var damage = 2;

                // TODO: duplicated check: put into CHECK.IS_FRIENDLY(mage)(character)
                function isFriendly(character) { return character === mage || character.mage === mage}
                var isEnemy = character => !isFriendly(character);

                var characters = getAllCharacters(),
                    numFriendlyCharacters = characters.filter(isFriendly).length,
                    numEnemyCharacters = characters.filter(isEnemy).length;

                function getSelectibles(alreadySelected) {
                    var numFriendlyTargets = alreadySelected.filter(isFriendly).length,
                        numEnemyTargets = alreadySelected.filter(isEnemy).length;

                    var selectables = (numFriendlyTargets >= numEnemyCharacters ? [] : characters.filter(isFriendly)).concat(
                        numEnemyTargets >= numFriendlyCharacters ? [] : characters.filter(isEnemy)
                    );

                    return _.difference(selectables, alreadySelected);
                }

                function isValidSelection(alreadySelected) {
                    var numFriendlyTargets = alreadySelected.filter(isFriendly).length,
                        numEnemyTargets = alreadySelected.filter(isEnemy).length;
                    return numFriendlyTargets === numEnemyTargets &&
                        numFriendlyTargets + numEnemyTargets === alreadySelected.length;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .each(generateDealDamageToSingleTarget(damage, FerociousAssault.index));
            });
        }
    );

    var LifeDrain = Spell.createSpell(
        'Life Drain',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.SHADOW,
                Syllables.TO
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target a friendly and an enemy Character:
Deal 2 Damage to the enemy Character and heal the friendly Character by 2 HP.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Life Drain: Select a friendly and an enemy target.');

                var damage = 2;

                function friendlyCharacter(character) {
                    return character === mage || character.mage === mage;
                }

                var characters = getAllCharacters();
                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 2) {
                        return [];
                    } else if(alreadySelected.length === 1) {
                        var selectedTarget = alreadySelected[0];
                        var isSelectedTargetFriendly = friendlyCharacter(selectedTarget);
                        return characters.filter(character => {
                            return friendlyCharacter(character) !== isSelectedTargetFriendly;
                        });
                    } else {
                        return characters;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 2 &&
                        friendlyCharacter(alreadySelected[0]) !== friendlyCharacter(alreadySelected[1]);
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .spread((target1, target2) => {
                        var enemy = friendlyCharacter(target1) ? target2 : target1;
                        var friend = friendlyCharacter(target1) ? target1 : target2;

                        return generateDealDamageToSingleTarget(damage, LifeDrain.index)(enemy)
                        // TODO: as EVENT_GAIN_HP
                            .then(() => { friend.hp += 2; });
                    });
            });
        }
    );

    var StrengthDrain = Spell.createSpell(
        'Strength Drain',
        [
            new SyllableSequence([
                Syllables.FIRE,
                Syllables.WATER,
                Syllables.TO
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target a Mage and a Familiar:
Deal 2 Damage to the first target and give +2/+2 to the other.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Strength Drain: Select a mage and a familiar.');

                var damage = 2;

                // TODO: !CHECK:IS_PERMANENT is not the correct check for a mage
                function isMage(character) { return !CHECK.IS_PERMANENT(character)}
                // TODO: this check is currently used as an IS_FAMILIAR
                var isFamiliar = CHECK.IS_PERMANENT;

                var characters = getAllCharacters();
                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 2) {
                        return [];
                    } else if(alreadySelected.length === 1) {
                        var selectedTarget = alreadySelected[0];
                        var filterFunctionForNextTarget = isFamiliar(selectedTarget) ? isMage : isFamiliar;
                        return characters.filter(filterFunctionForNextTarget);
                    } else {
                        return characters;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 2 && (
                            (isFamiliar(alreadySelected[0]) && isMage(alreadySelected[1])) ||
                            (isMage(alreadySelected[0]) && isFamiliar(alreadySelected[1]))
                        );
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .spread((target1, target2) => {
                        var mage = isMage(target1) ? target1 : target2;
                        var familiar = isMage(target1) ? target2 : target1;

                        return generateDealDamageToSingleTarget(damage, StrengthDrain.index)(mage)
                            .then(() => {
                                // TODO: as EVENT_GAIN_AT
                                familiar.at += 2;
                                // TODO: as EVENT_GAIN_HP
                                familiar.hp += 2;
                            });
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
                var infoMessage = new InfoMessage('Break Down Punch: Select 2 targets.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var familiars = getAllCharacters().filter(CHECK.IS_PERMANENT);
                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 2) {
                        return [];
                    } else if(alreadySelected.length === 1) {
                        // should be 'let' variable declaration
                        var firstTarget = alreadySelected[0];
                        return familiars.filter(familiar => familiar.at !== firstTarget.at)
                    } else if(alreadySelected.length === 0) {
                        return familiars;
                    }
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 2 &&
                        alreadySelected[0].at !== alreadySelected[1].at;
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .spread((target1, target2) => {
                        // TODO: currently damages own mage, not opponents
                        return generateDealDamageToSingleTarget(Math.abs(target1.at - target2.at), BreakDownPunch.index)(mage);
                    });
            });
        }
    );

    var HiddenStrength = Spell.createSpell(
        'Hidden Strength',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                Syllables.MA,
                Syllables.REN
            ], SyllableSequence.ordered),
        ],
        `Sorcery
Target 3 Familiars with different AT: Their AT becomes the highest of the 3.`,
        function resolveSpell(mage) {
            return ifEnemyResolveElseDo(mage, function() {
                var infoMessage = new InfoMessage('Hidden Strength: Select 3 targets.');

                // TODO: this check is currently used as an IS_FAMILIAR
                var familiars = getAllCharacters().filter(CHECK.IS_PERMANENT);
                function getSelectibles(alreadySelected) {
                    if(alreadySelected.length >= 3) {
                        return [];
                    }
                    return familiars.filter(familiar => {
                        return alreadySelected.reduce((acc, selectedTarget) => {
                            return acc && familiar.at !== selectedTarget.at;
                        }, true);
                    });
                }

                function allDifferent(values) {
                    return values.length === _.unique(values).length;
                }

                function isValidSelection(alreadySelected) {
                    return alreadySelected.length === 3 &&
                        allDifferent(alreadySelected.map(target => target.at));
                }

                return selectTarget(getSelectibles, isValidSelection, {
                    infoMessage: infoMessage
                })
                    .then(targets => {
                        var highestAT = _.max(targets, target => target.at).at;
                        targets.forEach(target => target.at = highestAT);
                    });
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
            var infoMessage = new InfoMessage('Purge Ray: Select a target.');

            // TODO: use SUBTYPE_LIGHTNING
            var damage = game.battlefield.getCharactersMatching(function(character) {
                return character === mage || character.mage === mage;
            }).length;

            return ifEnemyResolveElseDo(mage, function() {
                return selectNumberOfUniqueTargets(getAllCharacters(), 1, 1, {
                    infoMessage: infoMessage
                })
                    .spread(generateDealDamageToSingleTarget(damage, PurgeRay.index));
            });
        }
    );

    var SunlitEidolon = Spell.createSpell(
        'Sunlit Eidolon',
        [
            new SyllableSequence([
                Syllables.LIGHT,
                //Syllables.KUN,
                //Syllables.MA,
                //Syllables.REN,
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
                    creatingSpell: SunlitEidolon,
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
                    creatingSpell: LightWeaver,
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
                    creatingSpell: AdlezTheSilverFang,
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
        WildPyromancer,
        GoblinAttackSquad,
        RaidLeader,

        MediumOfFire,

        FirePillars,
        ImpulseSalvo,

        ShatteredGrowth,
        RockSlide,
        RagingFlames,
        Cultivate,
        GeneModification,
        ChainBuff,

        Brocky,

        Roast,
        Enrage,
        BrothersInArms,
        RaiseStruggle,

        ForkedBolt,
        SkyFire,
        FireRain,
        HungryDemon,
        ShieldKnight,
        Overheat,
        ChainLightning,
        SymphonyOfTheBoundSoul,
        FlameThrower,
        GoblinBombardment,
        BlessingAndCurse,
        FerociousAssault,
        LifeDrain,
        StrengthDrain,
        BreakDownPunch,
        HiddenStrength,
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
