export function tryPlaceSyllableAndCastSpells(insertionIndex, syllableBoard, syllable, callback) {
  var syllablePlaced = syllableBoard.checkAndPlaceSyllable(
    insertionIndex,
    syllable
  );
  if(syllablePlaced) {
    var spellChecker = new SpellChecker();

    syllableBoard.mage.spellBook.spells.forEach(function(spell) {
      spellChecker.checkForSpell(
        insertionIndex,
        syllableBoard,
        spell,
        callback
      );
    });
  }
}

// HACK: only you are your ally
export function allied(player1, player2) {
  return player1 === player2;
}
