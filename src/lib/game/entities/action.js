ig.module(
	'game.entities.action'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

EntityAction = ig.Entity.extend({
	size: {x:32, y:16},
	animSheet: new ig.AnimationSheet('media/timeline.png', 32, 16),
	init: function(x, y, settings) {
		this.parent(x, y, settings);

        this.applySettings(settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [0], true);
	},
	draw: function() {
		this.parent();

        var label = this.model.baseDelay + ': ' + (this.model.recurring === Action.recurring ? 'recu' : 'once'),
            x = this.pos.x + this.animSheet.width / 2,
            y = this.pos.y + this.animSheet.height / 4;
        GUI.Font.draw(label, x, y, ig.Font.ALIGN.CENTER);
	}
});

});
