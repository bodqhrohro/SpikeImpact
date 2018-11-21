import Phaser from 'phaser'
import world from './world'

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
		game.load.image('scoreFont', 'img/scoreFont.gif')
	}

	initLvl1 = (game) => {
		window.addEventListener('resize', this._onResize)
		this._onResize()

		game.physics.startSystem(Phaser.Physics.ARCADE)

		game.stage.backgroundColor = '#587373'
		game.stage.smoothed = false

		game.world.setBounds(0, 0, 1800, fieldSize.HEIGHT)

		this.gameOver = false
		this.win = false

		this.health = new (function(_this) {
			var setText = (text) => text ? this.font.setText(text, false, 1) : this.font.clear()

			var health = 2
			var accel = 1

			this.damage = () => {
				--health ? (
					_this.twilight.cameraOffset.x = 30,
					_this.twilight.cameraOffset.y = 30
				) : (
					_this.gameOver = true,
					game.time.events.loop(
						Phaser.Timer.SECOND * 0.05,
						() => _this.twilight.cameraOffset.y += (accel++),
						_this.onGameOver()
					)
				)
				setText('*'.repeat(health))
			}

			this.font = game.add.retroFont('scoreFont', 4, 7, '*', 1, 1, 0, 65)
			setText('**')

			this.text = game.add.image(1, 1, this.font)
			this.text.fixedToCamera = true
		})(this)

		this.score = new function() {
			var setText = (text) => this.font.setText(text, false, 1)

			this.count = 0

			this.font = game.add.retroFont('scoreFont', 4, 7, '0123456789', 10, 1)
			setText('00000')

			this.text = game.add.image(295, 1, this.font)
			this.text.fixedToCamera = true

			this.add = (delta) => {
				this.count += delta
				setText(Phaser.Animation.generateFrameNames('', this.count, this.count, '', 5)[0])
			}
		}

		this.scrolls = game.add.group()

		this.twilight = game.add.sprite(30, 30, 'lvl1', 'dummy')

		this.spike = game.add.sprite(15, 0, 'lvl1', 'dummy')

		this.spikePaw = game.add.sprite(1, 3, 'lvl1', 'dummy')
		this.spikeBody = game.add.sprite(0, 0, 'lvl1', 'spikeBody00')
		this.spike.addChild(this.spikePaw)
		this.spike.addChild(this.spikeBody)

		this.twilightBody = game.add.sprite(0, 0, 'lvl1', 'twilightBody')
		this.twilightWing = game.add.sprite(9, 18, 'lvl1', 'twilightWing')

		this.twilightWing.anchor.setTo(0, 1)
		game.time.events.loop(Phaser.Timer.SECOND * 0.4, () => this.twilightWing.scale.y = -this.twilightWing.scale.y)

		this.twilight.addChild(this.twilightBody)
		this.twilight.addChild(this.spike)
		this.twilight.addChild(this.twilightWing)
		this.twilight.fixedToCamera = true

		this.spikePaw.animations.add(
			'throw',
			Phaser.Animation.generateFrameNames('spikePaw', 0, 2, '', 2).concat('dummy'),
			10
		).onComplete.add(this.createBullet)

		this.mobs = new Map()
		for (let mobType in world.lvl1) {
			this.mobs.set(mobType, game.add.group(undefined, mobType))
			world.lvl1[mobType].coords.forEach((coords) => this.spawnMob(mobType, coords))
		}

		game.physics.arcade.enable([...this.mobs.values()])
		game.physics.arcade.enable(this.twilightBody)

		game.time.events.loop(Phaser.Timer.SECOND * 0.05, () => game.camera.x++)

		this._setupKeyboard(game)

		game.add.sound('bgmusic', 1, true).play()

		document.querySelector('#viewport .loader').style.display = 'none'
	}

	_setupKeyboard = (game) => {
		this.input = Object.assign(game.input.keyboard.createCursorKeys(), {
			space: game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR),
			enter: game.input.keyboard.addKey(Phaser.KeyCode.ENTER),
			w: game.input.keyboard.addKey(Phaser.KeyCode.W),
			a: game.input.keyboard.addKey(Phaser.KeyCode.A),
			s: game.input.keyboard.addKey(Phaser.KeyCode.S),
			d: game.input.keyboard.addKey(Phaser.KeyCode.D)
		})
		game.input.keyboard.addKey(Phaser.KeyCode.Z).onUp.add(() => game.sound.mute = !game.sound.mute)
	}

	update = (game) => {
		if (this.gameOver) return

		if (this.input.up.isDown || this.input.w.isDown) {
			this.twilightWing.scale.y = -1
			this._setIf((y) => y-=2, (y) => y > fieldBounds.UP, this.twilight.cameraOffset, 'y')
		} else if (this.input.down.isDown || this.input.s.isDown) {
			this.twilightWing.scale.y = 1
			this._setIf((y) => y+=2, (y) => y < fieldBounds.BOTTOM - 19, this.twilight.cameraOffset, 'y')
		} else if (this.input.left.isDown || this.input.a.isDown) {
			this._setIf((x) => x-=2, (x) => x > fieldBounds.LEFT, this.twilight.cameraOffset, 'x')
		} else if (this.input.right.isDown || this.input.d.isDown) {
			this._setIf((x) => x+=2, (x) => x < fieldBounds.RIGHT - 30, this.twilight.cameraOffset, 'x')
		} else if (this.input.space.isDown || this.input.enter.isDown) {
			this.spikePaw.animations.play('throw')
		}

		for (let [mobType, mobGroup] of this.mobs) {
			game.physics.arcade.collide(mobGroup, this.scrolls, (mob, scroll) => {
				if (mob.health > 1) {
					mob.damage(1)
					if (!mobType.indexOf('parasprite')) {
						game.time.events.add(
							Phaser.Timer.SECOND * 2,
							() => {
								if (mob.alive) {
									game.physics.arcade.enable([
										this.spawnMob(mob.parent.name, { x: mob.x, y: mob.y-10 }),
										this.spawnMob(mob.parent.name, { x: mob.x, y: mob.y+10 })
									])
									mob.destroy()
								}
							}
						)
					}
				} else {
					this.killMob(mob)
					if (mob.parent.name == 'tiret') {
						this.gameOver = true
						this.win = true
						this.onGameOver()
					}
				}
				scroll.kill()
			}, null, this)
			game.physics.arcade.collide(this.twilightBody, mobGroup, (twi, mob) => {
				if (mob.parent.name != 'tiret')
					this.killMob(mob)
				this.health.damage()
			})
		}
	}

	_setIf = (action, predicate, object, property) => {
		let updated = action(object[property])
		if (predicate(updated))
			object[property] = updated
	}

	createBullet = () => {
		let bullet = this.scrolls.create(this.spike.world.x + 13, this.spike.world.y + 4, 'lvl1', 'scroll')
		this.game.physics.arcade.enable(bullet)

		bullet.events.onKilled.add(() => this._removeTimer(), this)

		let timer = this.game.time.events.loop(
			Phaser.Timer.SECOND / 60,
			() => bullet.position.x - this.game.camera.x < fieldBounds.RIGHT
				? bullet.position.x+=2
				: (
					bullet.destroy()
				  ,	this._removeTimer(timer)
				)
		)
	}

	_removeTimer = (timer) => this.game.time.events.remove(timer)

	_onResize = () => {
		let scaleFactor = Math.min(window.innerWidth/fieldSize.WIDTH, window.innerHeight/fieldSize.HEIGHT)|0
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
		this.game.scale.setUserScale(scaleFactor, scaleFactor, 0, 0)
	}

	spawnMob = (mobType, coords) => {
		let mob = this.mobs.get(mobType).create(coords.x, coords.y, 'lvl1', mobType + '00')
		mob.health = world.lvl1[mobType].health
		if (mobType == 'tiret') {
			let phase
			let timer = this.game.time.events.loop(
				Phaser.Timer.SECOND * 0.05,
				() => {
					if (!mob.alive) {
						this._removeTimer(timer)
						return
					}
					if (mob.y <=20) {
						phase = 1
					} else if (mob.y >=70) {
						phase = -1
					}
					mob.y += phase
				}
			)
		} else {
			mob.animations.add(mobType + 'Fly', Phaser.Animation.generateFrameNames(mobType, 0, 1, '', 2))
			mob.animations.play(mobType + 'Fly', 2, true)
		}
		return mob
	}

	killMob = (mob) => {
		mob.kill()
		this.score.add(world.lvl1[mob.parent.name].score)
	}

	onGameOver = () => {}
}

export default SpikeImpactGame
