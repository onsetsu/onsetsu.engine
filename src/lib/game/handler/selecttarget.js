ig.module(
    'game.handler.selecttarget'
)
.requires(

)
.defines(function(){

GUI.SelectTarget = ig.Class.extend({
    init: function(targets, side, callback) {
        this.targets = targets;
        this.GUISide = side;
        this.callback = callback;
    },
    doIt: function() {
        if(ig.input.pressed('leftclick')) {
            var hoveredOn = _(this.targets).find(function(target) {
                var targetEntity = this.GUISide.entitiesByPermanent.get(target) || this.GUISide.entitiesByMage.get(target);
                return ig.input.hover(targetEntity);
            }, this);

            if(hoveredOn) {
                GUI.game.selectTarget = undefined;

                this.callback(hoveredOn);
            }
        }
    }
});

});
