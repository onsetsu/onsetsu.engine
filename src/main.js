// --------------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------------

var game, engine, GUI;

GUI = {};

ig.module(
  'init.game'
)
.requires(
  'game.game'
)
.defines(function(){

  var temp = {
    startGame: function() {
      datGui.destroy();

      game = new Game();
      configureGameForTwoPlayers();
      engine = new Engine();

      ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );
    }
  }

  datGui = new dat.GUI();
  datGui.add(temp, 'startGame');
});
