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
	//'game.entities.battle-field',
	//'game.entities.field',
	//'game.entities.info-text',
	//'game.entities.spell',
	//'game.entities.spell-checker',
	//'game.entities.spell-list',
	'game.entities.syllable',
	//'game.entities.syllable-board',
	//'game.entities.syllable-selection',
	//'game.entities.time-line',

    // maps
	'game.levels.battle',

	// handler
	'game.handler.selecttarget',

	'impact.debug.debug',

	'game.impactextension'
)
.defines(function(){

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

        EntityDebug = ig.Entity.extend({
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
        EntityDebug.pos = { x: 200, y: 600 };
        EntityDebug.spawn = function(settings) {
            GUI.game.spawnEntity(EntityDebug, EntityDebug.pos.x, EntityDebug.pos.y, settings);
                EntityDebug.pos.x += 66;
        };

        EntityDebug.spawn({
            label: 'Add Player',
            onclick: function() {
                var player = new Player(),
                    mage = new Mage(
                        player,
                        15,
                        5,
                        9,
                        new SyllableBoard({ x: 6, y: 6 }),
                        createTestSpellbook(),
                        createStandardSyllablePool()
                    );
                game.addPlayer(player);
                mage.putOntoBattlefield();
            }
        });
        EntityDebug.spawn({
            label: 'Add Mage',
            onclick: function() {
                new Mage(
                    GUI.game.visualizedMainPlayer,
                    17,
                    42,
                    5,
                    new SyllableBoard({ x: 3, y: 3 }),
                    createTestSpellbook(),
                    createStandardSyllablePool()
                ).putOntoBattlefield();
            }
        });
        EntityDebug.spawn({
            label: 'Remove Mage',
            onclick: function() {
                var mages = game.battlefield.sides.get(GUI.game.visualizedMainPlayer).mages
                var mageToRemove = mages[mages.length - 1];
                mageToRemove.removeFromBattlefield();
            }
        });
        EntityDebug.spawn({
            label: 'Add Familiar',
            onclick: function() {
                var mage = game.battlefield.sides.get(GUI.game.visualizedMainPlayer).mages[0];
                (new Permanent({
                    spellTypes: [SpellType.Familiar],
                    hp: 2,
                    at: 3,
                    delay: 3
                }, mage)).putOntoBattlefield();
            }
        });
        EntityDebug.spawn({
            label: 'Remove Familiar',
            onclick: function() {
                var side = game.battlefield.sides.get(GUI.game.visualizedMainPlayer),
                    permanent = side.permanents[0];
                permanent.removeFromBattlefield();
            }
        });
        // TODO: works, but does not trigger rerendering yet
        EntityDebug.spawn({
            label: 'Become Artifact',
            onclick: function() {
                var side = game.battlefield.sides.get(GUI.game.visualizedMainPlayer)
                    permanent = _.sample(side.permanents);
                permanent.spellTypes = [SpellType.Artifact];
            }
        });
        EntityDebug.spawn({
            label: 'Selectable',
            onclick: function() {
                this.visualizeSelectable(!this.shouldVisualizeSelectable);
            }
        });
        EntityDebug.spawn({
            label: 'Advance Time',
            onclick: function() {
                var currentAction = game.timeline.nextAction();
                if(currentAction) {
                    console.log('ACTION', currentAction);

                    if(currentAction.recurring === Action.recurring) {
                        game.timeline.resetAction(currentAction);
                    } else {
                        game.timeline.removeAction(currentAction);
                    }
                    GUI.game.timeline.moveAllActions();
                } else {
                    game.timeline.advance();
                }
            }
        });
        EntityDebug.spawn({
            label: 'Battle Test',
            onclick: function() {
                // Simulate a whole battle

                var side1 = game.battlefield.sides.get(GUI.game.visualizedMainPlayer),
                    combatant1 = _(side1.permanents).find(function(perm) {
                        return _(perm.spellTypes).contains(SpellType.Familiar);
                    }),
                    combatant1Entity = GUI.game.battlefield.entitiesBySide
                        .get(side1)
                        .entitiesByPermanent.get(combatant1);

                // Get possible targets
                var side2 = game.battlefield.sides.get(combatant1.mage.controller.opponent);
                var targets = _(side2.permanents).filter(function(permanent) {
                    return _(permanent.spellTypes).contains(SpellType.Familiar);
                });

                targets.push(side2.mages[0]);

                var GUIside2 = GUI.game.battlefield.entitiesBySide.get(side2);
                targets.forEach(function(target) {
                    var targetEntity = GUIside2.entitiesByPermanent.get(target) || GUIside2.entitiesByMage.get(target);
                    targetEntity.visualizeSelectable(true);
                });

                GUI.game.selectTarget = new GUI.SelectTarget(targets, GUIside2, function(combatant2) {
                    targets.forEach(function(target) {
                        var targetEntity = GUIside2.entitiesByPermanent.get(target) || GUIside2.entitiesByMage.get(target);
                        targetEntity.visualizeSelectable(false);
                    });

                     var combatant2Entity = GUIside2.entitiesByPermanent.get(combatant2) || GUIside2.entitiesByMage.get(combatant2);

                    combatant1Entity.drawBattleLine(combatant2Entity, 2)
                        .then(function() {
                            new Battle(combatant1, combatant2);
                            console.log("battle ended");

                            game.battlefield.removeDefeatedPermanents();
                        });
                });
            }
        });
        EntityDebug.spawn({
            label: 'Advance Til Next',
            onclick: function() {
                GUI.game.advanceTimeToNextAction()
                    .then(function(action) {
                        console.log('Advanced to:', action);
                        return action;
                    }).delay(1500).then(function(currentAction) {
                        // TODO: what if the associated Permanent was defeated in battle?
                        if(currentAction) {
                            console.log('ACTION', currentAction);

                            if(currentAction.recurring === Action.recurring) {
                                game.timeline.resetAction(currentAction);
                            } else {
                                game.timeline.removeAction(currentAction);
                            }
                            GUI.game.timeline.moveAllActions();
                        }
                    }).delay(1500);
            }
        });
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

        // PLACE SYLLABLES
        // start dragging
        if(ig.input.pressed('leftclick')) {
            var hoveredSyllable = _(this.syllablePool.syllables).find(function(entity) { return ig.input.hover(entity); });
            if(hoveredSyllable) {
                this.dragEntity = hoveredSyllable.copy();
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

                tryPlaceSyllableAndCastSpells(
                    syllableIndex,
                    syllableBoard,
                    syllable,
                    callback
                );

                game.stack.process()
                    .then(function() { console.log('DONE PROCESSING STACK'); });
            }

            this.dragEntity.kill();
            this.dragEntity = undefined;
        }

        // SWITCH SYLLABLES
        // start dragging
        if(ig.input.pressed('leftclick')) {
            var hoveredField = _.find(this.syllableBoard.fields, function(field) { return ig.input.hover(field); });
            if(hoveredField) {
                var hoveredSyllable = this.syllableBoard.syllableStones[hoveredField.index.x][hoveredField.index.y];
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
            var hoveredField = _(this.syllableBoard.fields).find(function(entity) { return ig.input.hover(entity); });
            if(hoveredField) {
                var hoveredSyllable = this.syllableBoard.syllableStones[hoveredField.index.x][hoveredField.index.y];
                if(hoveredSyllable) {
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

        // select target
        if(this.selectTarget) {
            this.selectTarget.doIt();
        }
	},

	advanceTimeToNextAction: function(withAction) {
	    var loop = Promise.resolve();

	    return new Promise(function(resolve, reject) {

            var currentAction = game.timeline.nextAction();
            while(!currentAction) {
                game.timeline.advance();
                currentAction = game.timeline.nextAction();
            }
            resolve(currentAction);
	    });
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();

		// Add your own drawing code here
	}
});

});
