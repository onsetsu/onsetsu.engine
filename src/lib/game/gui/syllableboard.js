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
	init: function() {
	    this.fields = [];

	    var syllableboard = this.getModel();
        syllableboard.fields.forEach(function(stripe, indexX) {
            stripe.forEach(function(field, indexY) {
                var field = GUI.game.spawnEntity(
                    EntityField,
                    this.pos.x + EntityField.prototype.size.x * indexX,
                    this.pos.y + EntityField.prototype.size.y * indexY,
                    { model: field }
                );
                this.fields.push(field);
            }, this);
        }, this);

        syllableboard.syllableStones.forEach(function(column, indexX) {
            column.forEach(function(syllableStone, indexY) {
                DataBindings.watch(column, indexY, (function() {
                    GUI.game.spawnEntity(
                        EntitySyllable,
                        this.pos.x + EntitySyllable.prototype.size.x * indexX,
                        this.pos.y + EntitySyllable.prototype.size.y * indexY,
                        { model: column[indexY].syllable }
                    );
                }).bind(this));
                if(syllableStone) {
                    GUI.game.spawnEntity(
                        EntitySyllable,
                        this.pos.x + EntitySyllable.prototype.size.x * indexX,
                        this.pos.y + EntitySyllable.prototype.size.y * indexY,
                        { model: syllableStone.syllable }
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
