import Turn from './turn.js';
import EntityInfoMessage from './entities/info_message.js';
import SelectTarget from './handler/selecttarget.js';
import LevelBattle from './levels/battle.js';
import Timeline from './gui/timeline.js';
import Battlefield from './gui/battlefield.js';
import SpellBook from './gui/spellbook.js';
import SyllablePool from './gui/syllablepool.js';
import SyllableBoard from './gui/syllableboard.js';
import { defaultFont } from './font.js';
import { tryPlaceSyllableAndCastSpells } from './../engine/engineutilities.js';
import { Battle } from './../engine/enginebattlefield.js';
import { SpellType } from './../engine/enginespell.js';

export default ig.Game.extend({

    // Load a font
    font: new ig.Font( 'media/04b03.font.png' ),


    init: function() {
        GUI.game = this;

        // Initialize your game here; bind keys etc.
        ig.input.bind(ig.KEY.MOUSE1, 'leftclick');
        ig.input.bind(ig.KEY.MOUSE2, 'rightclick');

        // Initialize Battle Field
        this.loadLevel(LevelBattle);

        this.visualizedMainPlayer = game.players[isHost ? 0 : 1];
        this.opponentPlayer = game.players[isHost ? 1 : 0];
        this.visualizedMainPlayer.opponent = this.opponentPlayer;
        this.opponentPlayer.opponent = this.visualizedMainPlayer;

        this.syllablePool = new SyllablePool();
        this.spellBook = new SpellBook();
        this.syllableBoard = new SyllableBoard(this.visualizedMainPlayer);
        this.opponentSyllableBoard = new SyllableBoard(this.opponentPlayer);
        this.timeline = new Timeline();
        this.battlefield = new Battlefield();

        EntityDebug = window.EntityDebug = ig.Entity.extend({
            size: {x:64, y:32},
            animSheet: new ig.AnimationSheet('media/debug.png', 64, 32),
            init: function(x, y, settings) {
                this.parent(x, y, settings);

                this.addAnim('visible', 1, [0], true);
                this.applySettings(settings);
            },
            applySettings: function(settings) {
                this.settings = settings;
            },
            update: function() {
                this.parent();

                if(this.settings.onclick && ig.input.pressed('leftclick') && ig.input.hover(this)) {
                    console.log(this.settings.label);
                    this.settings.onclick.call(this);
                }
            },
            draw: function() {
                this.parent();

                if(this.settings.label) {
                    var label = this.settings.label,
                        x = this.pos.x + this.animSheet.width / 2,
                        y = this.pos.y + (this.animSheet.height - defaultFont.heightForString(label)) / 2;
                    defaultFont.draw(label, x, y, ig.Font.ALIGN.CENTER);
                }
            }
        });
        EntityDebug.pos = { x: 50, y: 600 };
        EntityDebug.spawn = function(settings) {
            GUI.game.spawnEntity(EntityDebug, EntityDebug.pos.x, EntityDebug.pos.y, settings);
            EntityDebug.pos.x += 66;
        };

        // START TIMELINE LOOP
        Promise.resolve().delay(2).then(function() {
            GUI.game.spawnEntity(EntityInfoMessage, 300, 100);
            return GUI.game.advanceAndProcessTurn();
        });
    },

    startBattle: function(combatant1) {
        // Simulate a whole battle

        // TODO: use game.battlefield.getAllCharactersMatching or getAllCharacters.filter
        // Get possible targets
        var side2 = game.battlefield.sides.get(combatant1.mage.controller.opponent);
        var targets = _(side2.permanents).filter(function(permanent) {
            return _(permanent.spellTypes).contains(SpellType.Familiar);
        });

        targets.push(side2.mages[0]);

        return new Promise(function(resolve, reject) {
            secureSelectTarget(...generateNumberOfUniqueTargets(targets, 1, 1), {}, targets => targets.spread(function(combatant2) {
                GUI.game.animatedBattle(combatant1, combatant2).then(function() {
                    resolve([combatant1, combatant2]);
                });
            }));

            //selectNumberOfUniqueTargets(targets, 1, 1).spread(function(combatant2) {
            //    GUI.game.animatedBattle(combatant1, combatant2).then(function() {
            //        resolve([combatant1, combatant2]);
            //    });
            //});
        });
    },

    animatedBattle: function(combatant1, combatant2) {
        var combatant1Entity = GUI.game.battlefield.getEntityFor(combatant1),
            combatant2Entity = GUI.game.battlefield.getEntityFor(combatant2);

        return combatant1Entity.drawBattleLine(combatant2Entity, 2)
            .then(function() {
                new Battle(combatant1, combatant2);
                console.log("battle ended");
            })
            .then(checkStateBasedActions)
            .delay(2000);
    },

    advanceAndProcessTurn: function() {
        return GUI.game.advanceTimeToNextAction()
            .delay(1000)
            .then(function(action) {
                GUI.game.battlefield.getEntityFor(action.character).markOnTurn(true);
                return new Turn(action).whenFinished();
            }).then(function resetAction(currentAction) {
                if(currentAction.character.isOnBattlefield()) {
                    GUI.game.battlefield.getEntityFor(currentAction.character).markOnTurn(false);
                    game.timeline.resetAction(currentAction);
                }
                GUI.game.timeline.moveAllActions();
            })
            .delay(1500)
            .then(GUI.game.advanceAndProcessTurn);
    },

    update: function() {
        // Update all entities and backgroundMaps
        this.parent();

        // Add your own, additional update code here
        this.syllablePool.update();
        this.spellBook.update();
        this.syllableBoard.update();
        this.timeline.update();
        this.battlefield.update();

        if(GUI.game.endTurnEntity && !GUI.game.endTurnEntity.noSyllableInteraction) {
            // PLACE SYLLABLES
            // start dragging
            if(ig.input.pressed('leftclick')) {
                var hoveredSyllable = _(this.syllablePool.syllables).find(function(entity) { return ig.input.hover(entity); });
                if(hoveredSyllable) {
                    this.dragEntity = hoveredSyllable.copy();
                    this.dragEntity.original = hoveredSyllable;
                }
            }

            // dragging
            if(this.dragEntity) {
                this.dragEntity.pos.x = ig.input.mouse.x - this.dragEntity.size.x / 2;
                this.dragEntity.pos.y = ig.input.mouse.y - this.dragEntity.size.y / 2;
            }

            // dropping
            if(this.dragEntity && ig.input.released('leftclick')) {
                var hoveredField = _(this.syllableBoard.fields).find(function(entity) { return ig.input.hover(entity); });

                if(hoveredField) {
                    var syllableIndex = hoveredField.model.index,
                        syllableBoard = this.syllableBoard.getModel(),
                        syllable = this.dragEntity.model,
                        callback = function castFromBoard(ConcreteSpell, startIndex, direction) {
                            console.log('CAST on Stack', ConcreteSpell, startIndex, ''+direction);
                            game.eventManager.execute(EVENT_CAST_SPELL, ConcreteSpell, syllableBoard.mage);
                        };

                    env.conn.send({
                        command: 'placeSyllable',
                        fieldX: syllableIndex.x,
                        fieldY: syllableIndex.y,
                        indexInSyllablePool: this.syllablePool.syllables.indexOf(this.dragEntity.original)
                    });

                    tryPlaceSyllableAndCastSpells(
                        syllableIndex,
                        syllableBoard,
                        syllable,
                        callback
                    );

                    GUI.game.endTurnEntity.pos.x -= 1000;
                    GUI.game.endTurnEntity.noSyllableInteraction = true;
                    game.stack.process()
                        .then(function() {
                            GUI.game.endTurnEntity.pos.x += 1000;
                            GUI.game.endTurnEntity.noSyllableInteraction = false;
                        });
                }

                this.dragEntity.kill();
                this.dragEntity = undefined;
            }

            // SWITCH SYLLABLES
            // start dragging
            if(ig.input.pressed('leftclick')) {
                let hoveredField = _.find(this.syllableBoard.fields, function(field) { return ig.input.hover(field); });
                if(hoveredField) {
                    let hoveredSyllable = this.syllableBoard.syllableStones[hoveredField.index.x][hoveredField.index.y];
                    if(hoveredSyllable) {
                        this.dragStoneEntity = hoveredSyllable;
                    }
                }
            }

            // dragging
            if(this.dragStoneEntity) {
                this.dragStoneEntity.pos.x = ig.input.mouse.x - this.dragStoneEntity.size.x / 2;
                this.dragStoneEntity.pos.y = ig.input.mouse.y - this.dragStoneEntity.size.y / 2;
            }

            // dropping
            if(this.dragStoneEntity && ig.input.released('leftclick')) {
                let hoveredField = _(this.syllableBoard.fields).find(function(entity) { return ig.input.hover(entity); });
                if(hoveredField) {
                    let hoveredSyllable = this.syllableBoard.syllableStones[hoveredField.index.x][hoveredField.index.y];
                    if(hoveredSyllable) {
                        env.conn.send({
                            command: 'switchSyllables',
                            fiend1x: this.dragStoneEntity.index.x,
                            fiend1y: this.dragStoneEntity.index.y,
                            fiend2x: hoveredSyllable.index.x,
                            fiend2y: hoveredSyllable.index.y
                        });
                        if(this.syllableBoard.getModel().switchSyllables(this.dragStoneEntity.index, hoveredSyllable.index)) {
                            this.dragStoneEntity.kill();
                            hoveredSyllable.kill();
                            var successful = true;
                        }
                    }
                }

                if(!successful) {
                    this.syllableBoard.resetPosition(this.dragStoneEntity);
                }
                this.dragStoneEntity = undefined;
            }
        }

        // select target
        SelectTarget.update();
    },

    advanceTimeToNextAction: function() {
        return new Promise(function(resolve, reject) {
            var currentAction = game.timeline.nextAction();
            while(!currentAction) {
                game.timeline.advance();
                currentAction = game.timeline.nextAction();
            }
            resolve(currentAction);
        });
    }
});
