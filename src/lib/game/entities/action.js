ig.module(
	'game.entities.action'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

EntityAction = ig.Entity.extend({
	size: {x:32, y:32},
	animSheet: new ig.AnimationSheet('media/board.png', 32, 32),
	init: function(x, y, settings) {
		this.parent(x, y, settings);
return;
        this.applySettings(settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [0], true);
	},
	draw: function() {
        // get description
		var description = GUI.FieldDescriptions[this.model.type];
		// HACK:
        this.anims.visible.sequence[0] = (description || GUI.FieldDescriptions.default).sheetIndexStart;

		this.parent();
	}
});

});
