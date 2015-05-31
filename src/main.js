// --------------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------------

var game, engine, GUI;

window.onload = function() {
  var temp = {
    main: function() {
      game = new Game();
      configureGameForTwoPlayers();
      engine = new Engine();

      GUI = {};

      ig.module(
      	'???'
      )
      .requires(
      	'game.game'
      )
      .defines(function(){

        ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );

      });
    }
  }

  datGui = new dat.GUI();
  datGui.add(temp, 'main');
}
