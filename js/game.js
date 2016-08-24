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
		game.load.audio('bgmusic', 'snd/bgmusic.ogg')
	}

	initLvl1 = (game) => {
		window.addEventListener('resize', this._onResize)
		this._onResize()

		game.stage.backgroundColor = '#587373'
		game.stage.smoothed = false

		this.scrolls = []

		this.twilight = game.add.sprite(30, 30, 'lvl1', 'dummy')

		this.spike = game.add.sprite(15, 0, 'lvl1', 'dummy')

		this.spikePaw = game.add.sprite(1, 3, 'lvl1', 'dummy')
		this.spikeBody = game.add.sprite(0, 0, 'lvl1', 'spikeBody00')
		this.spike.addChild(this.spikePaw)
		this.spike.addChild(this.spikeBody)

		this.twilightBody = game.add.sprite(0, 0, 'lvl1', 'twilightBody')
		this.twilightWing = game.add.sprite(9, 18, 'lvl1', 'twilightWing')

		this.twilightWing.anchor.setTo(0, 1)
		this.game.time.events.loop(Phaser.Timer.SECOND * 0.4, () => this.twilightWing.scale.y = -this.twilightWing.scale.y)

		this.twilight.addChild(this.twilightBody)
		this.twilight.addChild(this.spike)
		this.twilight.addChild(this.twilightWing)

		this.spikePaw.animations.add(
			'throw',
			Phaser.Animation.generateFrameNames('spikePaw', 0, 2, '', 2).concat('dummy'),
			10
		).onComplete.add(this.createBullet)

		this.input = Object.assign(game.input.keyboard.createCursorKeys(), {
			space: game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR),
			enter: game.input.keyboard.addKey(Phaser.KeyCode.ENTER),
			w: game.input.keyboard.addKey(Phaser.KeyCode.W),
			a: game.input.keyboard.addKey(Phaser.KeyCode.A),
			s: game.input.keyboard.addKey(Phaser.KeyCode.S),
			d: game.input.keyboard.addKey(Phaser.KeyCode.D)
		})

		game.add.sound('bgmusic', 1, true).play()

		document.querySelector('#viewport .loader').style.display = 'none'
	}

	update = (game) => {
		if (this.input.up.isDown || this.input.w.isDown) {
			this.twilightWing.scale.y = -1
			this._setIf((y) => y-=4, (y) => y > fieldBounds.UP, this.twilight.position, 'y')
		} else if (this.input.down.isDown || this.input.s.isDown) {
			this.twilightWing.scale.y = 1
			this._setIf((y) => y+=4, (y) => y < fieldBounds.BOTTOM - 19, this.twilight.position, 'y')
		} else if (this.input.left.isDown || this.input.a.isDown) {
			this._setIf((x) => x-=4, (x) => x > fieldBounds.LEFT, this.twilight.position, 'x')
		} else if (this.input.right.isDown || this.input.d.isDown) {
			this._setIf((x) => x+=4, (x) => x < fieldBounds.RIGHT - 30, this.twilight.position, 'x')
		} else if (this.input.space.isDown || this.input.enter.isDown) {
			this.spikePaw.animations.play('throw')
		}
	}

	_setIf = (action, predicate, object, property) => {
		let updated = action(object[property])
		if (predicate(updated))
			object[property] = updated
	}

	createBullet = () => {
		let bullet = new Phaser.Sprite(this.game, this.spike.world.x + 13, this.spike.world.y + 4, 'lvl1', 'scroll')
		this.game.world.addChildAt(bullet, 0)
		var timer = this.game.time.events.loop(
			Phaser.Timer.SECOND * 0.05,
			() => bullet.position.x < fieldBounds.RIGHT
				? bullet.position.x++
				: (
					bullet.destroy()
				  ,	this.game.time.events.remove(timer)
				  ,	this.scrolls.splice(this.scrolls.indexOf(bullet), 1)
				)
		)
		this.scrolls.push(bullet)
	}

	_onResize = () => {
		let scaleFactor = Math.min(window.innerWidth/fieldSize.WIDTH, window.innerHeight/fieldSize.HEIGHT)|0
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
		this.game.scale.setUserScale(scaleFactor, scaleFactor, 0, 0)
	}
}

export default new SpikeImpactGame()
