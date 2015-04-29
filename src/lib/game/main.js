var GUI = {};

ig.module(
	'game.main' 
)
.requires(
	'game.game'
)
.defines(function(){

ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );

});
