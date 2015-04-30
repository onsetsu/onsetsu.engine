ig.module(
	'game.game'
)
.requires(
	'impact.game',
	'impact.font',

    'game.gui.spellbook',
	'game.gui.syllablepool',
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

        this.syllablePool = new GUI.SyllablePool();
        this.spellBook = new GUI.SpellBook();
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

		// Add your own, additional update code here
        this.syllablePool.update();
        this.spellBook.update();
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();

		// Add your own drawing code here
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
