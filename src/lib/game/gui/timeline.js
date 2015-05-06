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
    paddingBetweenTimelineSlots: 4,
    paddingBetweenActions: 2,
	init: function() {
        var position = { x: 500, y: 500 };

        _.range(10).forEach(function(delay) {
            var model = game.timeline.getSlotAt(delay);
            return GUI.game.spawnEntity(
                EntityTimelineSlot,
                position.x + delay * (EntityTimelineSlot.prototype.size.x + + this.paddingBetweenTimelineSlots),
                position.y,
                { model: model }
            );
        }, this);

        var spawnAction = (function(action) {
            var timelineSlot = game.timeline.getTimelineSlotFor(action);
            var indexInTimelineSlot = timelineSlot.actions.indexOf(action);
            return GUI.game.spawnEntity(
                EntityAction,
                position.x
                    + timelineSlot.delay * (EntityTimelineSlot.prototype.size.x + + this.paddingBetweenTimelineSlots)
                    + (EntityTimelineSlot.prototype.size.x - EntityAction.prototype.size.x) / 2,
                position.y
                    - indexInTimelineSlot * (EntityAction.prototype.size.y + this.paddingBetweenActions)
                    + EntityTimelineSlot.prototype.size.y - EntityAction.prototype.size.y,
                { model: action }
            );
        }).bind(this);

        game.timeline.actions.forEach(spawnAction, this);

        game.timeline.addAction = _.wrap(game.timeline.addAction.bind(game.timeline), function(original, action) {
            var returnValue = original(action);
            spawnAction(action);
            return returnValue;
        });
	},

	update: function() {}
});

});
