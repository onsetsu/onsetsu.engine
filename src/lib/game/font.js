ig.module(
	'game.font'
)
.requires(
	'impact.font'
)
.defines(function(){

GUI.Font = new ig.Font('media/onsetsufontblack.png');
GUI.Font.letterSpacing -= 2;
GUI.Font.lineSpacing -= 2;

});
