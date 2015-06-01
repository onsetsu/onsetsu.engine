ig.module(
	'game.entities.mage'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

EntityMage = ig.Entity.extend({
	size: {x:48, y:48},
	animSheet: new ig.AnimationSheet('media/mages.png', 48, 48),
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

        // draw hp
        // TODO: split into currentHP and maxHp
        var hp = this.model.hp,
            maxHp = this.model.maxHp,
            x = this.pos.x + this.animSheet.width;
        GUI.Font.draw(hp + '/' + maxHp + ' HP', x, this.pos.y, ig.Font.ALIGN.RIGHT);

        // draw sp
        // TODO: split into currentSP and maxSp
        var sp = this.model.sp.toString(),
            maxSp = this.model.maxSp.toString(),
            x = this.pos.x + this.animSheet.width,
            y = this.pos.y + this.animSheet.height - GUI.Font.heightForString(sp);
        GUI.Font.draw(sp + '/' + maxSp + ' SP', x, y, ig.Font.ALIGN.RIGHT);

        // TODO: draw Attack value if present

        // TODO: duplicated with EntityPermanent
        if(ig.input.hover(this)) {
            for(var action of GUI.game.timeline.entitiesByAction.keys()) {
                if(this.model.action === action) {
                    this.drawRelatedTo(GUI.game.timeline.entitiesByAction.get(action));
                }
            };
        }
	}
});

});
