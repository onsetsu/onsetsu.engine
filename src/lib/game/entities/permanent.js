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

        // draw hp if present
        if(this.model.hp) {
            var hp = this.model.hp.toString(),
                x = this.pos.x + this.animSheet.width,
                y = this.pos.y + this.animSheet.height - GUI.Font.heightForString(hp);
            GUI.Font.draw(hp, x, y, ig.Font.ALIGN.RIGHT);
        }

        // draw at if present
        if(this.model.at) {
            var at = this.model.at.toString(),
                y = this.pos.y + this.animSheet.height - GUI.Font.heightForString(hp);
            GUI.Font.draw(at, this.pos.x, y, ig.Font.ALIGN.LEFT);
        }
	}
});

});
