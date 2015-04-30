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
	init: function() {
        game.players[0].mages[0].syllableBoard.fields.forEach(function(stripe, indexX) {
            stripe.forEach(function(field, indexY) {
                GUI.game.spawnEntity(
                    EntityField,
                    200 + EntityField.prototype.size.x * indexX,
                    100 + EntityField.prototype.size.y * indexY,
                    { model: field }
                );
            });
        });
	},

	update: function() {}
});

});
