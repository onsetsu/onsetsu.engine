// --------------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------------

var game,
    engine,
    env = {},
    GUI = {},
    isHost;

ig.module(
  'init.game'
)
.requires(
  'game.game'
)
.defines(function(){
  var runMain = function(host) {
    game = new Game();
    configureGameForTwoPlayers();
    engine = new Engine();
    isHost = host;

    ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );
  };

  Networking.setup(runMain);
});
