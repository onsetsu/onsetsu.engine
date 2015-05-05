ig.module(
	'game.entities.timelineslot'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

EntityTimelineSlot = ig.Entity.extend({
	size: {x:48, y:48},
	animSheet: new ig.AnimationSheet('media/timeline.png', 48, 48),
	init: function(x, y, settings) {
		this.parent(x, y, settings);

        this.applySettings(settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [1], true);
	},
	draw: function() {
        // get description
		//var description = GUI.FieldDescriptions[this.model.type];
		// HACK:
        //this.anims.visible.sequence[0] = (description || GUI.FieldDescriptions.default).sheetIndexStart;
		this.parent();
		GUI.Font.draw(this.model.delay, this.pos.x + this.size.x / 2, this.pos.y, ig.Font.ALIGN.CENTER);
	}
});

});
