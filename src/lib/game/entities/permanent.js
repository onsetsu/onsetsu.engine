ig.module(
	'game.entities.permanent'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

EntityPermanent = ig.Entity.extend({
	size: {x:32, y:48},
	animSheet: new ig.AnimationSheet('media/permanents.png', 32, 48),
	init: function(x, y, settings) {
		this.parent(x, y, settings);

        //this.applySettings(settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [0], true);

		return this;
	},
	draw: function() {
		this.parent();

        //var label = this.model.baseDelay + ': ' + (this.model.recurring === Action.recurring ? 'recu' : 'once'),
        //    x = this.pos.x + this.animSheet.width / 2,
        //    y = this.pos.y + this.animSheet.height / 4;
        //GUI.Font.draw(label, x, y, ig.Font.ALIGN.CENTER);
	}
});

});
