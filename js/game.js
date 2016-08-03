import Phaser from 'phaser'

const fieldSize = {
	WIDTH: 320,
	HEIGHT: 200
}

const fieldBounds = {
	LEFT: 0,
	RIGHT: 319,
	UP: 12,
	BOTTOM: 199
}

class SpikeImpactGame {
	constructor() {
		this.game = new Phaser.Game(
			fieldSize.WIDTH,
			fieldSize.HEIGHT,
			Phaser.AUTO,
			document.getElementById('viewport'),
			{
				create: this.initLvl1,
				preload: this.preload,
				update: this.update
			},
			false,
			false
		)
	}

	preload = (game) => {
		game.load.atlas('lvl1', 'img/sprite1.gif', 'img/sprite1.json')
	}

	initLvl1 = (game) => {
		window.addEventListener('resize', this._onResize)
		this._onResize()

		game.stage.backgroundColor = '#b0e7e7'
		game.stage.smoothed = false

		this.spike = game.add.sprite(30, 30, 'lvl1', 'dummy')

		this.spikePaw = game.add.sprite(1, 3, 'lvl1', 'dummy')
		this.spikeBody = game.add.sprite(0, 0, 'lvl1', 'spikeBody00')
		this.spike.addChild(this.spikePaw)
		this.spike.addChild(this.spikeBody)

		this.spikePaw.animations.add(
			'throw',
			Phaser.Animation.generateFrameNames('spikePaw', 0, 2, '', 2).concat('dummy'),
			10
		).onComplete.add(this.createBullet)

		this.input = game.input.keyboard.createCursorKeys()

		document.querySelector('#viewport .loader').style.display = 'none'
	}

	update = (game) => {
		if (this.input.up.isDown) {
			this._setIf((y) => y-=4, (y) => y > fieldBounds.UP, this.spike.position, 'y')
		} else if (this.input.down.isDown) {
			this._setIf((y) => y+=4, (y) => y < fieldBounds.BOTTOM - 19, this.spike.position, 'y')
		} else if (this.input.right.isDown) {
			this.spikePaw.animations.play('throw')
		}
	}

	_setIf = (action, predicate, object, property) => {
		let updated = action(object[property])
		if (predicate(updated))
			object[property] = updated
	}

	createBullet = () => {
		let bullet = this.game.add.sprite(this.spike.position.x + 13, this.spike.position.y + 4, 'lvl1', 'scroll')
		this.game.time.events.loop(Phaser.Timer.SECOND * 0.05, () => bullet.position.x++)
	}

	_onResize = () => {
		let scaleFactor = Math.min(window.innerWidth/fieldSize.WIDTH, window.innerHeight/fieldSize.HEIGHT)|0
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
		this.game.scale.setUserScale(scaleFactor, scaleFactor, 0, 0)
	}
}

export default new SpikeImpactGame()
