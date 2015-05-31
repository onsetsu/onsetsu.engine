// --------------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------------

var game,
    engine,
    env = {},
    GUI = {};

ig.module(
  'init.game'
)
.requires(
  'game.game'
)
.defines(function(){
  var runMain = function(isHost) {
    game = new Game();
    configureGameForTwoPlayers();
    engine = new Engine();

    ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );
  };

  setupNetworking(runMain);
});
