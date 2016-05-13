import EntityAction from './../entities/action.js';
import EntityTimelineSlot from './../entities/timelineslot.js';

const PADDING_BETWEEN_TIMELINE_SLOTS = 4,
    PADDING_BETWEEN_ACTIONS = 2;

export default class {
	constructor() {
        var position = { x: 500, y: 500 };

        this.entitiesByAction = new Map();

        this.timelineSlots = _.range(10).map(function(delay) {
            var model = game.timeline.getSlotAt(delay);
            return GUI.game.spawnEntity(
                EntityTimelineSlot,
                position.x + delay * (EntityTimelineSlot.prototype.size.x + PADDING_BETWEEN_TIMELINE_SLOTS),
                position.y
            ).applySettings({ model: model });
        }, this);

        var getEntityActionPosition = (function(action) {
            var timelineSlot = game.timeline.getTimelineSlotFor(action);
            var indexInTimelineSlot = timelineSlot.actions.indexOf(action);
            return {
                x: position.x
                    + timelineSlot.delay * (EntityTimelineSlot.prototype.size.x + PADDING_BETWEEN_TIMELINE_SLOTS)
                    + (EntityTimelineSlot.prototype.size.x - EntityAction.prototype.size.x) / 2,
                y: position.y
                    - indexInTimelineSlot * (EntityAction.prototype.size.y + PADDING_BETWEEN_ACTIONS)
                    + EntityTimelineSlot.prototype.size.y - EntityAction.prototype.size.y
            };
        }).bind(this);

        var spawnAction = (function(action) {
            var entityPosition = getEntityActionPosition(action);
            var entity = GUI.game.spawnEntity(
                EntityAction,
                entityPosition.x,
                entityPosition.y
            ).applySettings({ model: action });
            this.entitiesByAction.set(action, entity);
            return entity;
        }).bind(this);

        var moveAllActions = this.moveAllActions = (function() {
            function foo(action) {
                try{
                    return getEntityActionPosition(action);
                } catch(e) {
                    console.log('ERROR: evil action', action);
                    return {x:100, y:10};
                }
            }
            this.entitiesByAction.forEach(function(entity, action) {
                entity.move(foo(action), 1.5);
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
                moveAllActions();
            }

            return returnValue;
        }).bind(this));

        game.timeline.advance = _.wrap(game.timeline.advance.bind(game.timeline), (function(original) {
            var returnValue = original();
            moveAllActions();
            return returnValue;
        }).bind(this));
	}
    update() {}
}
