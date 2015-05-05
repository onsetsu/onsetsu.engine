ig.module(
	'game.gui.timeline'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.timelineslot',
	'game.entities.action'
)
.defines(function(){

GUI.Timeline = ig.Class.extend({
    paddingBetweenActions: 2,
	init: function() {
        var position = { x: 500, y: 500 };

        _.range(10).forEach(function(delay) {
            var model = game.timeline.getSlotAt(delay);
            return GUI.game.spawnEntity(
                EntityTimelineSlot,
                position.x + delay * (EntityTimelineSlot.prototype.size.x + + this.paddingBetweenActions),
                position.y,
                { model: model }
            );
        }, this);
	},

	update: function() {}
});

});
