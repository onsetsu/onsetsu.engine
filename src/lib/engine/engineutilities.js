// --------------------------------------------------------------------------------
// Utilities
// --------------------------------------------------------------------------------

tryPlaceSyllableAndCastSpells = function(insertionIndex, syllableBoard, syllable, callback) {
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
};
