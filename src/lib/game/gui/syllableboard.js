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
    pos: { x: 350, y: 100 },
    spawn: function(entityClass, indexX, indexY, model) {
        return GUI.game.spawnEntity(
            entityClass,
            this.pos.x + entityClass.prototype.size.x * indexX,
            this.pos.y + entityClass.prototype.size.y * indexY,
            { model: model }
        );
    },
	init: function() {
	    this.fields = [];

	    var syllableBoard = this.getModel();
        syllableBoard.fields.forEach(function(stripe, indexX) {
            stripe.forEach(function(field, indexY) {
                var fieldEntity = this.spawn(EntityField, indexX, indexY, field);
                this.fields.push(fieldEntity);
            }, this);
        }, this);

        syllableBoard.syllableStones.forEach(function(column, indexX) {
            column.forEach(function(syllableStone, indexY) {
                DataBindings.watch(column, indexY, (function() {
                    this.spawn(
                        EntitySyllable,
                        indexX,
                        indexY,
                        column[indexY].syllable
                    );
                }).bind(this));
                if(syllableStone) {
                    this.spawn(
                        EntitySyllable,
                        indexX,
                        indexY,
                        syllableStone.syllable
                    );
                }
            }, this);
        }, this);
	},
	getModel: function() {
	    return game.players[0].mages[0].syllableBoard;
	},

	update: function() {}
});

});
