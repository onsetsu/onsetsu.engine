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
            var timelineSlot = game.timeline.getTimelineSlotFor(action);
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

        var moveAllActions = (function() {
            this.entitiesByAction.forEach(function(entity, action) {
                entity.move(getEntityActionPosition(action), 1.5);
            });
        }).bind(this);

        game.timeline.actions.forEach(spawnAction, this);

        game.timeline.addAction = _.wrap(game.timeline.addAction.bind(game.timeline), (function(original, action) {
            var returnValue = original(action);
            if(this.entitiesByAction.has(action)) {
                moveAllActions();
            } else {
                spawnAction(action);
            }
            return returnValue;
        }).bind(this));

        game.timeline.removeAction = _.wrap(game.timeline.removeAction.bind(game.timeline), (function(original, action) {
            var returnValue = original(action);

            if(this.entitiesByAction.has(action)) {
                this.entitiesByAction.get(action).kill();
                this.entitiesByAction.delete(action);
            }

            return returnValue;
        }).bind(this));

        game.timeline.advance = _.wrap(game.timeline.advance.bind(game.timeline), (function(original) {
            var returnValue = original();
            moveAllActions();
            return returnValue;
        }).bind(this));

        // TODO: HACK: move this method to GUI.Timeline.prototype
        this.update =  function() {
            if(ig.input.pressed('leftclick') && GUI.game.hovered(this.timelineSlots[0])) {
                var currentAction = game.timeline.nextAction();
                if(currentAction) {
                    console.log('ACTION', currentAction);
                    // TODO: Move this to engine
                    if(currentAction.recurring === Action.recurring) {
                        game.timeline.resetAction(currentAction);
                    } else {
                        game.timeline.removeAction(currentAction);
                    }
                    moveAllActions();
                } else {
                    game.timeline.advance();
                }
            }
        }
	},

});

});
