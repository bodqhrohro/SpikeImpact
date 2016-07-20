var input, spikeSprite

onload = function() {
	var game = new Phaser.Game(320, 200, Phaser.AUTO, document.getElementById('#viewport'), { create: initLvl1, preload: preload, update: update }, false, false)
}

var preload = function(game) {
	game.load.atlas('lvl1', 'img/sprite1.gif', 'img/sprite1.json')
}

var initLvl1 = function(game) {
	game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
	game.scale.setUserScale(3, 3, 0, 0)
	spikeSprite = game.add.tileSprite(30, 30, 13, 19, 'lvl1', 'spikeBody00')

	input = game.input.keyboard.createCursorKeys()
}

var update = function(game) {
	if (input.up.isDown) {
		spikeSprite.position.y -= 4
	} else if (input.down.isDown) {
		spikeSprite.position.y += 4
	}
}
