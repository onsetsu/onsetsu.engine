ig.module(
    'game.handler.selecttarget'
)
.requires(

)
.defines(function(){

GUI.SelectTarget = ig.Class.extend({
    init: function(targets, callback) {
        this.targets = targets;
        this.callback = callback;

        this.targetEntities = targets.map(function(target) {
            var targetEntity = GUI.game.battlefield.getEntityFor(target);
            targetEntity.visualizeSelectable(true);
            return targetEntity;
        });

        GUI.SelectTarget.selectTarget = this;
    },
    doIt: function() {
        if(ig.input.pressed('leftclick')) {
            var hoveredOn = _(this.targets).find(function(target) {
                var targetEntity = GUI.game.battlefield.getEntityFor(target);
                return ig.input.hover(targetEntity);
            }, this);

            if(hoveredOn) {
                GUI.SelectTarget.selectTarget = undefined;

                this.targetEntities.forEach(function(targetEntity) {
                    targetEntity.visualizeSelectable(false);
                });

                this.callback(hoveredOn);
            }
        }
    }
});

});
