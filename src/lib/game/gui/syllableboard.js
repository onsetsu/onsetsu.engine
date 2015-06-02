ig.module(
	'game.gui.syllableboard'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.syllable',
	'game.entities.field'
)
.defines(function(){

GUI.SyllableBoard = ig.Class.extend({
    pos: { x: 350, y: 200 },
    spawn: function(entityClass, indexX, indexY, model) {
        var entity = GUI.game.spawnEntity(
            entityClass,
            this.pos.x + entityClass.prototype.size.x * indexX,
            this.pos.y + entityClass.prototype.size.y * indexY,
            { model: model }
        );
        entity.index = { x: indexX, y: indexY };

        return entity;
    },
    resetPosition: function(entity) {
        entity.pos.x = this.pos.x + entity.size.x * entity.index.x;
        entity.pos.y = this.pos.y + entity.size.y * entity.index.y;
    },
	init: function(player) {
	    if(player === GUI.game.opponentPlayer) {
	        this.pos = { x: 800, y: 100 }
	    }

	    this.fields = [];
	    this.syllableStones = [];

        this.setModel(player);
	    var syllableBoard = this.getModel();
        syllableBoard.fields.forEach(function(stripe, indexX) {
            stripe.forEach(function(field, indexY) {
                var fieldEntity = this.spawn(EntityField, indexX, indexY, field);
                this.fields.push(fieldEntity);
            }, this);
        }, this);

        syllableBoard.syllableStones.forEach(function(column, indexX) {
            this.syllableStones.push([]);
            column.forEach(function(syllableStone, indexY) {
                var spawnSyllableStone = (function(syllableModel) {
                    var syllableEntity = this.spawn(
                        EntitySyllable,
                        indexX,
                        indexY,
                        syllableModel
                    );
                    this.syllableStones[indexX][indexY] = syllableEntity;
                }).bind(this);

                DataBindings.watch(column, indexY, (function() {
                    spawnSyllableStone(column[indexY].syllable);
                }).bind(this));
                if(syllableStone) {
                    spawnSyllableStone(syllableStone.syllable);
                }
            }, this);
        }, this);
	},
	setModel: function(player) {
	    return this.model = game.battlefield.sides.get(player).mages[0].syllableBoard;
	},
	getModel: function() {
	    return this.model;
	},

	update: function() {}
});

});
