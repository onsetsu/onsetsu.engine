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

        this.entitiesByAction = new Map();

        this.timelineSlots = _.range(10).map(function(delay) {
            var model = game.timeline.getSlotAt(delay);
            return GUI.game.spawnEntity(
                EntityTimelineSlot,
                position.x + delay * (EntityTimelineSlot.prototype.size.x + + this.paddingBetweenTimelineSlots),
                position.y,
                { model: model }
            );
        }, this);

        var getEntityActionPosition = (function(action) {
            var timelineSlot = game.timeline.getTimelineSlotFor(action) || game.timeline.getSlotAt(-5);
            var indexInTimelineSlot = timelineSlot.actions.indexOf(action);
            return {
                x: position.x
                    + timelineSlot.delay * (EntityTimelineSlot.prototype.size.x + + this.paddingBetweenTimelineSlots)
                    + (EntityTimelineSlot.prototype.size.x - EntityAction.prototype.size.x) / 2,
                y: position.y
                    - indexInTimelineSlot * (EntityAction.prototype.size.y + this.paddingBetweenActions)
                    + EntityTimelineSlot.prototype.size.y - EntityAction.prototype.size.y,
            };
        }).bind(this);

        var spawnAction = (function(action) {
            var entityPosition = getEntityActionPosition(action);
            var entity = GUI.game.spawnEntity(
                EntityAction,
                entityPosition.x,
                entityPosition.y,
                { model: action }
            );
            this.entitiesByAction.set(action, entity);
            return entity;
        }).bind(this);

        game.timeline.actions.forEach(spawnAction, this);

        game.timeline.addAction = _.wrap(game.timeline.addAction.bind(game.timeline), (function(original, action) {
            var returnValue = original(action);
            if(this.entitiesByAction.has(action)) {
                this.entitiesByAction.forEach(function(entity, action) {
                    entity.move(getEntityActionPosition(action), 2);
                }, this);
            } else {
                spawnAction(action);
            }
            return returnValue;
        }).bind(this));

        game.timeline.advance = _.wrap(game.timeline.advance.bind(game.timeline), (function(original) {
            var returnValue = original();
            this.entitiesByAction.forEach(function(entity, action) {
                entity.move(getEntityActionPosition(action), 2);
            }, this);
            return returnValue;
        }).bind(this));

        this.update =  function() {
            if(ig.input.pressed('leftclick') && GUI.game.hovered(this.timelineSlots[0])) {
                var currentAction = game.timeline.nextAction();
                if(currentAction) {
                    console.log('ACTION', currentAction);
                    game.timeline.resetAction(currentAction);
                    this.entitiesByAction.forEach(function(entity, action) {
                        entity.move(getEntityActionPosition(action), 2);
                    }, this);
                } else {
                    game.timeline.advance();
                }
                //timeline.resetAction(firstAction);
            }
        }
	},

});

});
