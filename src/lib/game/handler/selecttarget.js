ig.module(
    'game.handler.selecttarget'
)
.requires(

)
.defines(function(){

GUI.SelectTarget = ig.Class.extend({
    init: function(callback, getSelectibles, isValidSelection, parameters) {
        this.callback = callback;
        this.getSelectibles = getSelectibles;
        this.isValidSelection = isValidSelection;
        this.parameters = parameters || {};

        this.selectedTargets = [];
        this.selectibles = this.getSelectibles(this.selectedTargets);

        this.targetEntities = this.selectibles.map(target => {
            var targetEntity = GUI.game.battlefield.getEntityFor(target);
            targetEntity.visualizeSelectable(true);
            return targetEntity;
        });

        GUI.SelectTarget.selectTarget = this;
        if(this.parameters.infoMessage) {
            this.parameters.infoId = EntityInfoMessage.instance.pushInfo(this.parameters.infoMessage);
        }

        this.checkForTargetSelectionCompleted();
    },
    // TODO: could be static
    getHoveredEntityForTargets: function(targets) {
        return _(targets).find(target => {
            var targetEntity = GUI.game.battlefield.getEntityFor(target);
            return ig.input.hover(targetEntity);
        });
    },
    isSelected: function(target) {
        return this.selectedTargets.indexOf(target) >= 0;
    },
    doIt: function() {
        if(ig.input.pressed('leftclick')) {
            // only the selectible targets should be possible
            let hoveredOn = this.getHoveredEntityForTargets(this.selectibles);
            if(hoveredOn) {
                if(!this.isSelected(hoveredOn) || this.parameters.multiTargeting) {
                    this.select(hoveredOn);
                }
                this.updateSelectibles();
                this.checkForTargetSelectionCompleted();
            } else {
                var hoveredOnSelected = this.getHoveredEntityForTargets(this.selectedTargets);

                if(hoveredOnSelected) {
                    // is the hovered target already selected?
                    if(this.isSelected(hoveredOnSelected)) {
                        this.deselect(hoveredOnSelected);
                    }
                    this.updateSelectibles();
                    this.checkForTargetSelectionCompleted();
                }
            }
        } else {
            if(ig.input.pressed('rightclick')) {
                let hoveredOn = this.getHoveredEntityForTargets(this.selectedTargets);
                if(hoveredOn) {
                    // is the hovered target already selected?
                    if(this.isSelected(hoveredOn)) {
                        this.deselect(hoveredOn);
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
        this.selectedTargets.push(target);
        GUI.game.battlefield.getEntityFor(target).visualizeSelected(true);
    },
    deselect: function(target) {
        var index = this.selectedTargets.lastIndexOf(target);
        this.selectedTargets.splice(index, 1);
        GUI.game.battlefield.getEntityFor(target).visualizeSelected(false);
    },
    clearSelectables: function() {
        this.targetEntities.forEach(entity => {
            entity.visualizeSelectable(false);
            entity.visualizeSelected(false);
            entity.clearSelectedNumbers();
        });
    },
    updateSelectibles: function() {
        this.clearSelectables();
        // TODO: selectibles and this.possibleTargets are out of sync
        // TODO: enable deselect of selected targets and
        // TODO: disable select of non-targetible entities
        this.selectibles = this.getSelectibles(this.selectedTargets);
        this.selectibles.forEach(selectible => {
            var entity = GUI.game.battlefield.getEntityFor(selectible);
            entity.visualizeSelectable(true);
        });
        var selecteds = this.selectedTargets;
        selecteds.forEach((selected, index) => {
            var entity = GUI.game.battlefield.getEntityFor(selected);
            entity.visualizeSelected(true);
            entity.addSelectedNumbers(index, this.parameters && this.parameters.showOnlyTargetQuantity);
        });
    },
    // automatically check for 'no more targets available!'
    // e.g.: Choose up to 4 targets, but only 2 available
    // and those are already selected
    checkForTargetSelectionCompleted: function() {
        if(this.isValidSelection(this.selectedTargets) &&
            this.getSelectibles(this.selectedTargets).length === 0) {
            this.completeTargeting();
        }
    },
    cancelToComplete: function() {
        if(this.isValidSelection(this.selectedTargets)) {
            this.completeTargeting();
        }
    },
    completeTargeting: function() {
        GUI.SelectTarget.selectTarget = undefined;
        if(this.parameters.infoId) {
            EntityInfoMessage.instance.popInfo(this.parameters.infoId);
        }
        this.clearSelectables();

        this.callback(this.selectedTargets);
    }
});

GUI.SelectTarget.update = function() {
    if(GUI.SelectTarget.selectTarget) {
        GUI.SelectTarget.selectTarget.doIt();
    }
};

});
