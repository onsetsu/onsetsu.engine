ig.module(
    'game.handler.selecttarget'
)
.requires(

)
.defines(function(){

GUI.SelectTarget = ig.Class.extend({
    init: function(possibleTargets, minNumTargets, maxNumTargets, callback) {
        this.possibleTargets = possibleTargets;
        this.minNumTargets = minNumTargets;
        this.maxNumTargets = maxNumTargets;
        this.callback = callback;
        this.actualTargets = [];

        this.targetEntities = possibleTargets.map(target => {
            var targetEntity = GUI.game.battlefield.getEntityFor(target);
            targetEntity.visualizeSelectable(true);
            return targetEntity;
        });

        GUI.SelectTarget.selectTarget = this;
    },
    doIt: function() {
        if(ig.input.pressed('leftclick')) {
            var hoveredOn = _(this.possibleTargets).find(target => {
                var targetEntity = GUI.game.battlefield.getEntityFor(target);
                return ig.input.hover(targetEntity);
            }, this);

            if(hoveredOn) {
                var indexOfHoveredOn = this.actualTargets.indexOf(hoveredOn);
                if(indexOfHoveredOn >= 0) {
                    // already selected target -> deselect target
                    this.actualTargets.splice(indexOfHoveredOn, 1);
                    GUI.game.battlefield.getEntityFor(hoveredOn).visualizeSelected(false);
                } else {
                    // new target
                    this.actualTargets.push(hoveredOn);
                    GUI.game.battlefield.getEntityFor(hoveredOn).visualizeSelected(true);
                }
                this.checkForTargetSelectionCompleted();
            }
        } else {
            if(ig.input.pressed('rightclick')) {
                this.cancelToComplete();
            }
        }
    },
    // TODO: check for 'no more targets available!'
    // e.g.: Choose up to 4 targets, but only 2 available
    // and those are already selected
    checkForTargetSelectionCompleted: function() {
        if(this.actualTargets.length === this.maxNumTargets) {
            this.completeTargeting();
        }
    },
    cancelToComplete: function() {
        var numTargets = this.actualTargets.length;
        if (numTargets >= this.minNumTargets && numTargets <= this.maxNumTargets) {
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
