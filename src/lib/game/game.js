'use strict';

ig.module(
	'game.game'
)
.requires(
	'impact.game',
	'impact.font',

    'game.gui.spellbook',
	'game.gui.syllablepool',
	'game.gui.syllableboard',
	'game.gui.timeline',
	'game.gui.battlefield',

    // entities
	'game.entities.syllable',

    // maps
	'game.levels.battle',

	// handler
	'game.handler.selecttarget',

	'game.impactextension'
)
.defines(function(){

window.Turn = ig.Class.extend({
    init: function(action) {
        this.action = action;
    },
    whenFinished: function() {
        var action = this.action;
        game.eventManager.execute(EVENT_START_TURN, action.character);
        var player = action.character.controller || action.character.mage.controller;
        console.log('Advanced to:', action);

        if(player === GUI.game.visualizedMainPlayer) {
            return new Promise(function(resolve, reject) {
                console.log('Main Player');
                if(action.character instanceof Permanent) {
                    console.log('Turn of Familiar');
                    GUI.game.startBattle(action.character).then(function(combatants) {
                        console.log('ENTITYDEBUG_BATTLE_TEST_FINISHED');
                        env.conn.send({
                            command: 'battle',
                            combatants: [combatants[0].id, combatants[1].id]
                        });
                        env.conn.send({
                            command: 'endTurn'
                        });
                        resolve(action);
                    });
                } else if(action.character instanceof Mage) {
                    console.log('Turn of Mage');
                    GUI.game.endTurnEntity = GUI.game.spawnEntity(EntityDebug, 350, 50, {
                        label: 'End Turn',
                        onclick: function() {
                            GUI.game.endTurnEntity = undefined;
                            this.kill();
                            env.conn.send({
                                command: 'endTurn'
                            });
                            resolve(action);
                        }
                    });
                } else {
                    throw new Error('neither Mage nor Familiar Turn');
                };
            });
        } else {
            console.log('Not-visualized Player');
            return new Promise(function(resolve, reject) {
                Networking.__ai_set_current_character__ && Networking.__ai_set_current_character__(action.character);
                var waitEntity = GUI.game.spawnEntity(EntityDebug, 350, 50, {
                    label: 'Wait For Opponent'
                });
                var listening = waitEntity.update = function() {
                    var message = Networking.getNextMessage();
                    if(message) {
                        switch (message.command) {
                          case 'endTurn':
                            this.kill();
                            resolve(action);
                            break;
                          case 'battle':
                            console.log('RECEIVED BATTLE');
                            waitEntity.update = function() {};
                            GUI.game.animatedBattle(
                                game.battlefield.charactersById.get(message.combatants[0]),
                                game.battlefield.charactersById.get(message.combatants[1])
                            ).then(function() {
                                waitEntity.update = listening;
                            });
                            break;
                          case 'switchSyllables':
                            var syllableBoard = game.battlefield.sides.get(GUI.game.opponentPlayer).mages[0].syllableBoard,
                                syl1 = GUI.game.opponentSyllableBoard.syllableStones[message.fiend1x][message.fiend1y],
                                syl2 = GUI.game.opponentSyllableBoard.syllableStones[message.fiend2x][message.fiend2y];

                            if(syllableBoard.switchSyllables(
                                syl1.index,
                                syl2.index)
                            ) {
                                syl1.kill();
                                syl2.kill();
                            }
                            break;
                          case 'placeSyllable':
                            var syllableIndex = {
                              x: message.fieldX,
                              y: message.fieldY
                            };
                            var syllableBoard = game.battlefield.sides.get(GUI.game.opponentPlayer).mages[0].syllableBoard;
                            var syllable = GUI.game.syllablePool.syllables[message.indexInSyllablePool].model.copy();
                            var callback = function(ConcreteSpell, startIndex, direction) {
                              console.log('CAST on Stack', ConcreteSpell, startIndex, ''+direction);
                              pushOnStack(ConcreteSpell, syllableBoard.mage);
                            };

                            tryPlaceSyllableAndCastSpells(
                                syllableIndex,
                                syllableBoard,
                                syllable,
                                callback
                            );

                            game.stack.process()
                                .then(function() { console.log('DONE PROCESSING STACK'); });
                            break;
                          case 'targetForDamage':
                            var target = game.battlefield.charactersById.get(message.targetId);
                            waitEntity.update = function() {};
                            GUI.game.spellBook.spellEntities[message.spellIndex]
                                .drawBattleLine(GUI.game.battlefield.getEntityFor(target), 2)
                                .then(function() {
                                    target.receiveDamage(message.damage);
                                    waitEntity.update = listening;
                                });
                            break;
                          default:
                            throw new Error('Non matching message received', message);
                            break;
                        }
                    }
                };
            });
        }
    }
});

GUI.Game = ig.Game.extend({

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

        this.syllablePool = new GUI.SyllablePool();
        this.spellBook = new GUI.SpellBook();
        this.syllableBoard = new GUI.SyllableBoard(this.visualizedMainPlayer);
        this.opponentSyllableBoard = new GUI.SyllableBoard(this.opponentPlayer);
        this.timeline = new GUI.Timeline();
        this.battlefield = new GUI.Battlefield();

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
                        y = this.pos.y + (this.animSheet.height - GUI.Font.heightForString(label)) / 2;
                    GUI.Font.draw(label, x, y, ig.Font.ALIGN.CENTER);
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
            return GUI.game.advanceAndProcessTurn();
        });
	},

	startBattle: function(combatant1) {
        // Simulate a whole battle

        // Get possible targets
        var side2 = game.battlefield.sides.get(combatant1.mage.controller.opponent);
        var targets = _(side2.permanents).filter(function(permanent) {
            return _(permanent.spellTypes).contains(SpellType.Familiar);
        });

        targets.push(side2.mages[0]);

        return new Promise(function(resolve, reject) {
            GUI.game.selectTarget = new GUI.SelectTarget(targets, function(combatant2) {
                GUI.game.animatedBattle(combatant1, combatant2).then(function() {
                    resolve([combatant1, combatant2]);
                });
            });
        });
	},

	animatedBattle: function(combatant1, combatant2) {
        return new Promise(function(resolve, reject) {
            var combatant1Entity = GUI.game.battlefield.getEntityFor(combatant1),
                combatant2Entity = GUI.game.battlefield.getEntityFor(combatant2);

            combatant1Entity.drawBattleLine(combatant2Entity, 2)
                .then(function() {
                    new Battle(combatant1, combatant2);
                    console.log("battle ended");
                })
                .then(checkStateBasedActions)
                .delay(2000)
                .then(resolve);
        });
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
                        callback = function(ConcreteSpell, startIndex, direction) {
                            console.log('CAST on Stack', ConcreteSpell, startIndex, ''+direction);
                            var spell = new ConcreteSpell();
                            spell.mage = syllableBoard.mage
                            game.stack.push(spell);
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
        if(this.selectTarget) {
            this.selectTarget.doIt();
        }
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

});
