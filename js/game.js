import Phaser from 'phaser'

class SpikeImpactGame {
	constructor() {
		this.game = new Phaser.Game(320, 200, Phaser.AUTO, document.getElementById('#viewport'), { create: this.initLvl1, preload: this.preload, update: this.update }, false, false)
	}

	input = null

	spikeSprite = null

	fieldBounds = {
		LEFT: 0,
		RIGHT: 319,
		UP: 12,
		BOTTOM: 199
	}

	preload = (game) => {
		game.load.atlas('lvl1', 'img/sprite1.gif', 'img/sprite1.json')
	}

	initLvl1 = (game) => {
		game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
		game.scale.setUserScale(3, 3, 0, 0)
		this.spikeSprite = game.add.tileSprite(30, 30, 13, 19, 'lvl1', 'spikeBody00')

		this.input = game.input.keyboard.createCursorKeys()
	}

	update = (game) => {
		if (this.input.up.isDown) {
			this.setIf((y) => y-=4, (y) => y > this.fieldBounds.UP, this.spikeSprite.position, 'y')
		} else if (this.input.down.isDown) {
			this.setIf((y) => y+=4, (y) => y < this.fieldBounds.BOTTOM - 19, this.spikeSprite.position, 'y')
		}
	}

	setIf = (action, predicate, object, property) => {
		var updated = action(object[property])
		if (predicate(updated))
			object[property] = updated
	}
}

export default new SpikeImpactGame()
