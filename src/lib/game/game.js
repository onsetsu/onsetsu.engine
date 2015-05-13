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

    // systems
	//'game.systems.tween',
	//'game.systems.widget',

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

                if(this.settings.onclick && ig.input.pressed('leftclick') && GUI.game.hovered(this)) {
                    console.log(this.settings.label);
                    this.settings.onclick();
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
        EntityDebug.pos = { x: 200, y: 10 };
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
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

        // TODO: move to ig.Input.prototype
        function hovered(entity) {
            if(ig.input.mouse.x < entity.pos.x) return false;
            if(ig.input.mouse.y < entity.pos.y) return false;
            if(ig.input.mouse.x > entity.pos.x + entity.size.x) return false;
            if(ig.input.mouse.y > entity.pos.y + entity.size.y) return false;
            return true;
        }
        this.hovered = hovered;

		// Add your own, additional update code here
        this.syllablePool.update();
        this.spellBook.update();
        this.syllableBoard.update();
        this.timeline.update();
        this.battlefield.update();

        // PLACE SYLLABLES
        // start dragging
        if(ig.input.pressed('leftclick')) {
            var hoveredSyllable = _(this.syllablePool.syllables).find(function(entity) { return hovered(entity); });
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
            var hoveredField = _(this.syllableBoard.fields).find(function(entity) { return hovered(entity); });

            if(hoveredField) {
                var syllableIndex = hoveredField.model.index,
                    syllableBoard = this.syllableBoard.getModel(),
                    syllable = this.dragEntity.model,
                    callback = function(spell, startIndex, direction) {
                        console.log("CAST", spell, startIndex, direction);
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
            var hoveredField = _.find(this.syllableBoard.fields, function(field) { return hovered(field); });
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
            var hoveredField = _(this.syllableBoard.fields).find(function(entity) { return hovered(entity); });
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

var originalUpdate = ig.Entity.prototype.update;
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
        var returnValue = originalUpdate.apply(this, arguments);

        if(this.tween) {
            // tween finished?
            if(this.tween.timeDone >= this.tween.duration) {
                this.pos.x = this.tween.endPosition.x;
                this.pos.y = this.tween.endPosition.y;
                this.tween = undefined;
                return returnValue;
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

        return returnValue;
	}
});

return;

ig.Entity.inject({
	handleMovementTrace: function( res ) {
		this.standing = false;

		if( res.collision.y ) {
			if( this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity ) {
				this.vel.y *= -this.bounciness;
			}
			else {
				if( this.vel.y > 0 ) {
					this.standing = true;
				}
				this.vel.y = 0;
			}
		}
		if( res.collision.x ) {
			if( this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity ) {
				this.vel.x *= -this.bounciness;
			}
			else {
				this.vel.x = 0;
			}
		}
		if( res.collision.slope ) {
			var s = res.collision.slope;

			if( this.bounciness > 0 ) {
				var proj = this.vel.x * s.nx + this.vel.y * s.ny;

				this.vel.x = (this.vel.x - s.nx * proj * 2) * this.bounciness;
				this.vel.y = (this.vel.y - s.ny * proj * 2) * this.bounciness;
			}
			else {
				var lengthSquared = s.x * s.x + s.y * s.y;
				var dot = (this.vel.x * s.x + this.vel.y * s.y)/lengthSquared;

				this.vel.x = s.x * dot;
				this.vel.y = s.y * dot;

				var angle = Math.atan2( s.x, s.y );
				if( angle > this.slopeStanding.min && angle < this.slopeStanding.max ) {
					this.standing = true;
				}
			}
		}

		// FIX
		this.pos.x = res.pos.x;
		this.pos.y = res.pos.y;
	}
});

var _SystemGame = ig.Game.extend({
	init: function() {
	    this.systems = [];
	},

	update: function() {
		this.systems.forEach(function(system) {
		    system.beforeUpdate();
		}, this);

		// Update all entities and backgroundMaps
		this.parent();

		this.systems.forEach(function(system) {
		    system.afterUpdate();
		}, this);
	},

	draw: function() {
		this.systems.forEach(function(system) {
		    system.beforeDraw();
		}, this);

		// Draw all entities and backgroundMaps
		this.parent();

		this.systems.forEach(function(system) {
		    system.afterDraw();
		}, this);
	},

	addSystem: function(systemClass) {
	    var system = new (systemClass)();
	    this.systems.push(system);
	}
});

Onsetsu.Game = _SystemGame.extend({
	init: function() {
	    this.parent();

		// Initialize your game here; bind keys etc.
		ig.input.bind(ig.KEY.MOUSE1, 'leftclick');
		ig.input.bind(ig.KEY.MOUSE2, 'rightclick');
		ig.input.bind(ig.KEY.MWHEEL_UP, 'scrollup');
		ig.input.bind(ig.KEY.MWHEEL_DOWN, 'scrolldown');

		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');

        // Initialize Battle Field
		this.loadLevel(LevelBattle);

        // stub player
        var mage = {};

        ([60, 70, 80, 20, 30, 40, 50]).forEach(function(xy) {
            var entity = this.spawnEntity(EntitySyllable, xy, xy+400, EntitySyllable.getFire());
            entity.zIndex = xy;
            entity.onclick(function() {
            });
        }, this);

        ([60, 70, 80, 20, 30, 40, 50]).forEach(function(xy) {
            var entity = this.spawnEntity(EntitySyllable, xy+100, xy+400, EntitySyllable.getWater());
            entity.zIndex = xy;
            entity.onclick(function() {
                new TWEEN.Tween(entity.pos)
                    .to({x:100}, 2000)
                    .onComplete(function() {})
                    .start();
            });
        }, this);

        this.spawnEntity(EntityField, 500, 400, { type: 'Fire' });
        this.spawnEntity(EntitySyllable, 500, 400, EntitySyllable.getFire());

        var syllableSelection = this.spawnEntity(EntitySyllableSelection, 250, 50, { mage: mage });

        var list = this.spawnEntity(EntitySpellList, 10, 10);
        list.addSpell(SpellDescriptions.Fireball);
        list.addSpell(SpellDescriptions.ChainLightning);
        list.addSpell(SpellDescriptions.Whirlwind);
        list.addSpell(SpellDescriptions.FrostNova);
        list.addSpell(SpellDescriptions.EarthWall);

        var board = this.spawnEntity(EntitySyllableBoard, 200, 100, {
            boardSize: { x: 10, y: 10 },
            mage: mage
        });
        board.getField(1,5).setAnim('Fire');
        board.placeSyllable(2,4, EntitySyllable.getShadow());
        board.placeSyllable(2,5, EntitySyllable.getSol());
        function syllablePlacing() {
            board.eachField(function(field) {
                field.onclick(function() {
                    field.setAnim('Fire');
                    board.eachField(function(f) { f.offclick(); });
                    syllableSelection.each(function(syllable) {
                        syllable.onclick(function() {
                            syllableSelection.each(function(s) { s.offclick(); });
                            board.placeSyllable(
                                field.indexX,
                                field.indexY,
                                syllable.getDescription()
                            );
                            new SpellChecker().checkForSpells(
                                field.indexX,
                                field.indexY,
                                board,
                                list,
                                function(desc, spell) {
                                    console.log(desc, spell);
                                }
                            );
                            syllablePlacing();
                        });
                    });
                });
            });
        }
        syllablePlacing();

        this.spawnEntity(EntitySpell, 600, 10, SpellDescriptions.ChainLightning);

		this.addSystem(SystemTween);
		this.addSystem(SystemWidget);
	},

	update: function() {
		this.parent();

		// Add your own, additional update code here
	    this.sortEntitiesDeferred();
	},

	draw: function() {
		this.parent();

		// Add your own drawing code here
	}
});

});
