ig.module(
    'game.handler.selecttarget'
)
.requires(

)
.defines(function(){

GUI.SelectTarget = ig.Class.extend({
    init: function(callback, special) {
        this.callback = callback;
        this.special = special;
        this.actualTargets = [];
        this.selectibles = this.special.getSelectibles(this.actualTargets);

        this.targetEntities = this.selectibles.map(target => {
            var targetEntity = GUI.game.battlefield.getEntityFor(target);
            targetEntity.visualizeSelectable(true);
            return targetEntity;
        });

        GUI.SelectTarget.selectTarget = this;
    },
    doIt: function() {
        if(ig.input.pressed('leftclick')) {
            // only the selectible targets should be possible
            var hoveredOn = _(this.selectibles).find(target => {
                var targetEntity = GUI.game.battlefield.getEntityFor(target);
                return ig.input.hover(targetEntity);
            }, this);

            if(hoveredOn) {
                var indexOfHoveredOn = this.actualTargets.indexOf(hoveredOn);
                if(indexOfHoveredOn < 0) {
                    // new target
                    this.select(hoveredOn);
                }
                this.updateSelectibles();
                this.checkForTargetSelectionCompleted();
            } else {
                var hoveredOnSelected = _(this.actualTargets).find(target => {
                    var targetEntity = GUI.game.battlefield.getEntityFor(target);
                    return ig.input.hover(targetEntity);
                }, this);

                if(hoveredOnSelected) {
                    var indexOfHoveredOn = this.actualTargets.indexOf(hoveredOnSelected);
                    // is the hovered target already selected?
                    if(indexOfHoveredOn >= 0) {
                        // deselect target
                        this.deselect(hoveredOnSelected, indexOfHoveredOn);
                    }
                    this.updateSelectibles();
                    this.checkForTargetSelectionCompleted();
                }
            }
        } else {
            if(ig.input.pressed('rightclick')) {
                var hoveredOn = _(this.actualTargets).find(target => {
                    var targetEntity = GUI.game.battlefield.getEntityFor(target);
                    return ig.input.hover(targetEntity);
                }, this);

                if(hoveredOn) {
                    var indexOfHoveredOn = this.actualTargets.indexOf(hoveredOn);
                    // is the hovered target already selected?
                    if(indexOfHoveredOn >= 0) {
                        // deselect target
                        this.deselect(hoveredOn, indexOfHoveredOn);
                    }
                    this.updateSelectibles();
                } else {
                    // check for completion
                    this.cancelToComplete();
                }
            }
        }
    },
    select: function(target) {
        this.actualTargets.push(target);
        GUI.game.battlefield.getEntityFor(target).visualizeSelected(true);
    },
    deselect: function(target, index) {
        this.actualTargets.splice(index, 1);
        GUI.game.battlefield.getEntityFor(target).visualizeSelected(false);
    },
    updateSelectibles: function() {
        this.targetEntities.forEach(entity => {
            entity.visualizeSelectable(false);
            entity.visualizeSelected(false);
        });
        // TODO: selectibles and this.possibleTargets are out of sync
        // TODO: enable deselect of selected targets and
        // TODO: disable select of non-targetible entities
        this.selectibles = this.special.getSelectibles(this.actualTargets);
        this.selectibles.forEach(selectible => {
            var entity = GUI.game.battlefield.getEntityFor(selectible);
            entity.visualizeSelectable(true);
        });
        var selecteds = this.actualTargets;
        selecteds.forEach(selected => {
            var entity = GUI.game.battlefield.getEntityFor(selected);
            entity.visualizeSelected(true);
        });
    },
    // automatically check for 'no more targets available!'
    // e.g.: Choose up to 4 targets, but only 2 available
    // and those are already selected
    checkForTargetSelectionCompleted: function() {
        if(this.special.isValidSelection(this.actualTargets) &&
            this.special.getSelectibles(this.actualTargets).length === 0) {
            this.completeTargeting();
        }
    },
    cancelToComplete: function() {
        if(this.special.isValidSelection(this.actualTargets)) {
            this.completeTargeting();
        }
    },
    completeTargeting: function() {
        GUI.SelectTarget.selectTarget = undefined;

        this.targetEntities.forEach(targetEntity => {
            targetEntity.visualizeSelectable(false);
            targetEntity.visualizeSelected(false);
        });

        this.callback(this.actualTargets);
    }
});

GUI.SelectTarget.update = function() {
    if(GUI.SelectTarget.selectTarget) {
        GUI.SelectTarget.selectTarget.doIt();
    }
};

});
