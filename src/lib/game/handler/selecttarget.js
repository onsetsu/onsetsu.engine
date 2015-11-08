ig.module(
    'game.handler.selecttarget'
)
.requires(

)
.defines(function(){

GUI.SelectTarget = ig.Class.extend({
    init: function(possibleTargets, numTargets, callback) {
        this.possibleTargets = possibleTargets;
        this.numTargets = numTargets;
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
        }
    },
    checkForTargetSelectionCompleted: function() {
        if(this.actualTargets.length === this.numTargets) {
            GUI.SelectTarget.selectTarget = undefined;

            this.targetEntities.forEach(targetEntity => {
                targetEntity.visualizeSelectable(false);
                targetEntity.visualizeSelected(false);
            });

            this.callback(this.actualTargets);
        }
    }
});

GUI.SelectTarget.update = function() {
    if(GUI.SelectTarget.selectTarget) {
        GUI.SelectTarget.selectTarget.doIt();
    }
};

});
