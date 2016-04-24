// --------------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------------

import {} from 'lib/networking.js';
import { configureGameForTwoPlayers } from 'lib/setup/setup.js';
import { Game } from 'lib/engine/enginegame.js';

window.game = undefined;
window.env = {};
window.GUI = {};
window.isHost = undefined;

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
    isHost = host;

    ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );
  };

  Networking.setup(runMain);
});
