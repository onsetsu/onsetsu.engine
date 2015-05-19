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

	'impact.debug.debug'
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

        this.visualizedMainPlayer = game.players[0];

        this.syllablePool = new GUI.SyllablePool();
        this.spellBook = new GUI.SpellBook();
        this.syllableBoard = new GUI.SyllableBoard();
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
                        new SyllableBoard({ x: 6, y: 6 }),
                        createTestSpellbook(),
                        createStandardSyllablePool()
                    );
                game.addPlayer(player);
                game.battlefield.addMage(mage);
            }
        });
        EntityDebug.spawn({
            label: 'Add Mage',
            onclick: function() {
                var mage = new Mage(
                        game.players[0],
                        17,
                        42,
                        new SyllableBoard({ x: 3, y: 3 }),
                        createTestSpellbook(),
                        createStandardSyllablePool()
                    );
                game.battlefield.addMage(mage);
            }
        });
        EntityDebug.spawn({
            label: 'Remove Mage',
            onclick: function() {
                var mages = game.battlefield.sides.get(game.players[0]).mages
                var mageToRemove = mages[mages.length - 1];
                game.battlefield.removeMage(mageToRemove);
            }
        });
        EntityDebug.spawn({
            label: 'Add Familiar',
            onclick: function() {
                var mage = game.battlefield.sides.get(game.players[0]).mages[0];
                game.battlefield.addPermanent(new Permanent({
                    spellTypes: [SpellType.Familiar],
                    hp: 2,
                    at: 3
                }), mage);
            }
        });
        EntityDebug.spawn({
            label: 'Remove Familiar',
            onclick: function() {
                var side = game.battlefield.sides.get(game.players[0])
                    mage = side.mages[0],
                    permanent = side.permanents[0];
                game.battlefield.removePermanent(permanent, mage);
            }
        });
        // TODO: works, but does not trigger rerendering yet
        EntityDebug.spawn({
            label: 'Become Artifact',
            onclick: function() {
                var side = game.battlefield.sides.get(game.players[0])
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
                        console.log("CAST on Stack", ConcreteSpell, startIndex, direction);
                        game.stack.push(new ConcreteSpell());
                    };

                tryPlaceSyllableAndCastSpells(
                    syllableIndex,
                    syllableBoard,
                    syllable,
                    callback
                );
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
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();

		// Add your own drawing code here
	}
});

ig.Input.inject({
    hover: function(entity) {
        if(this.mouse.x < entity.pos.x) return false;
        if(this.mouse.y < entity.pos.y) return false;
        if(this.mouse.x > entity.pos.x + entity.size.x) return false;
        if(this.mouse.y > entity.pos.y + entity.size.y) return false;
        return true;
    }
});

ig.Entity.inject({
	move: function(position, time) {
	    this.tween = {
	        startPosition: { x: this.pos.x, y: this.pos.y },
    	    endPosition: position,
    	    duration: time,
    	    timeDone: 0
	    };
	},
	update: function() {
        this.parent();

        if(this.tween) {
            // tween finished?
            if(this.tween.timeDone >= this.tween.duration) {
                this.pos.x = this.tween.endPosition.x;
                this.pos.y = this.tween.endPosition.y;
                this.tween = undefined;
                return;
            }

            var easeQuarticInOut = function(a) {
                if((a*=2)<1)
                    return 0.5*a*a*a*a;
                return-0.5*((a-=2)*a*a*a-2)
            };
            var easeLinear = function(a) { return a; };

            this.tween.timeDone += ig.system.tick;
            this.pos.x = this.tween.startPosition.x +
                (this.tween.endPosition.x - this.tween.startPosition.x) *
                easeQuarticInOut((this.tween.timeDone / this.tween.duration));
            this.pos.y = this.tween.startPosition.y +
                (this.tween.endPosition.y - this.tween.startPosition.y) *
                easeQuarticInOut((this.tween.timeDone / this.tween.duration));
        }
	},
	visualizeSelectable: function(value) {
	    this.shouldVisualizeSelectable = value;
	    this.dashOffset = 0;
	    this.dashOffsetSpeed = 40;
	},
	draw: function() {
	    this.parent();

        if(this.shouldVisualizeSelectable) {
            ig.system.context.save()
            ig.system.context.strokeStyle = this.colors.selectable;
            ig.system.context.setLineDash([4,4]);
            this.dashOffset += this.dashOffsetSpeed * ig.system.tick;
            while(this.dashOffset > 16) { this.dashOffset -= 16; }
            ig.system.context.lineDashOffset = -this.dashOffset;
            ig.system.context.lineWidth = 2.0;
            ig.system.context.strokeRect(
                ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
                ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
                this.size.x * ig.system.scale,
                this.size.y * ig.system.scale
            );
            ig.system.context.restore();
        }
	}
});

ig.Entity.prototype.colors.selectable = '#ff0'

});
