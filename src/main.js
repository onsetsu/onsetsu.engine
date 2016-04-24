import {} from 'lib/networking.js';
import { configureGameForTwoPlayers } from 'lib/setup/setup.js';
import { Game } from 'lib/engine/enginegame.js';

var runMain = function(host) {
  game = new Game();
  configureGameForTwoPlayers();
  isHost = host;

  ig.main( '#canvas', GUI.Game, 60, 1138, 640, 1 );
};

Networking.setup(runMain);
