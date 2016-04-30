export default ig.Entity.extend({
	size: {x:32, y:16},
	animSheet: new ig.AnimationSheet('media/timeline.png', 32, 16),
	init: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [0], true);

		return this;
	},
	draw: function() {
		this.parent();

        if(ig.input.hover(this)) {
            for(var fieldSide of GUI.game.battlefield.entitiesBySide.values()) {
                for(var permanent of fieldSide.entitiesByPermanent.keys()) {
                    if(this.model.character === permanent) {
                        this.drawRelatedTo(fieldSide.entitiesByPermanent.get(permanent));
                    }
                };
                for(var mage of fieldSide.entitiesByMage.keys()) {
                    if(this.model.character === mage) {
                        this.drawRelatedTo(fieldSide.entitiesByMage.get(mage));
                    }
                };
            };
        }

        var label = this.model.baseDelay + ': ' + (this.model.recurring === Action.recurring ? 'recu' : 'once'),
            x = this.pos.x + this.animSheet.width / 2,
            y = this.pos.y + this.animSheet.height / 4;
        GUI.Font.draw(label, x, y, ig.Font.ALIGN.CENTER);
	}
});
