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

const scoreFontSize = {
	WIDTH: 4,
	HEIGHT: 7
}

const TOP_BAR_Y_OFFSET = 1

let randGen = new Phaser.RandomDataGenerator()

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
		game.load.atlas('lvl1', 'img/sprite1.png', 'img/sprite1.json')
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
				if (--health) {
					_this.twilight.cameraOffset.x = 30
					_this.twilight.cameraOffset.y = 30
					_this.activateField('defense')
					_this.destroyBeam()
				} else {
					_this.gameOver = true
					game.time.events.loop(
						Phaser.Timer.SECOND * 0.05,
						() => _this.twilight.cameraOffset.y += (accel++),
						_this.onGameOver()
					)
				}
				setText('*'.repeat(health))
			}

			this.font = game.add.retroFont('scoreFont', scoreFontSize.WIDTH, scoreFontSize.HEIGHT, '*', 1, 1, 0, 65)
			setText('**')

			this.text = game.add.image(1, TOP_BAR_Y_OFFSET, this.font)
			this.text.fixedToCamera = true
		})(this)

		this.score = new function() {
			var setText = (text) => this.font.setText(text, false, 1)

			this.count = 0

			this.font = game.add.retroFont('scoreFont', scoreFontSize.WIDTH, scoreFontSize.HEIGHT, '0123456789', 10, 1)
			setText('00000')

			this.text = game.add.image(295, TOP_BAR_Y_OFFSET, this.font)
			this.text.fixedToCamera = true

			this.add = (delta) => {
				this.count += delta
				setText(Phaser.Animation.generateFrameNames('', this.count, this.count, '', 5)[0])
			}
		}

		this.mana = new function() {
			this.MANA_MAX = 1000

			this.amount = this.MANA_MAX

			this.font = game.add.retroFont('scoreFont', scoreFontSize.WIDTH, scoreFontSize.HEIGHT, 'AMN', 3, 1, 0, 50)
			this.font.setText('MANA', false, 1)

			this.text = game.add.image(50, TOP_BAR_Y_OFFSET, this.font)
			this.text.fixedToCamera = true

			const COLOR = 0xffffff
			const ALPHA = 1
			const MANA_BAR_WIDTH = 100
			const GAP = 2
			const MANA_BAR_WIDTH_THIRD = (MANA_BAR_WIDTH / 3) | 0

			this.manaFrame = game.add.graphics(70, TOP_BAR_Y_OFFSET)
			this.manaFrame.fixedToCamera = true
			this.manaFrame.lineStyle(1, COLOR, ALPHA)
			this.manaFrame.drawRect(0, 0, MANA_BAR_WIDTH + GAP * 2, scoreFontSize.HEIGHT)
			this.manaFrame.drawRect(MANA_BAR_WIDTH_THIRD + 1, 0, MANA_BAR_WIDTH_THIRD, scoreFontSize.HEIGHT)

			this.manaBar = game.add.graphics(70 + GAP, TOP_BAR_Y_OFFSET + GAP)
			this.manaBar.fixedToCamera = true

			this.updateManaBar = () => {
				const COLOR = this.amount < this.MANA_MAX / 3
					? 0xff0000
					: (this.amount < this.MANA_MAX * 2 /3
						? 0xffff00
						: 0x00ff00
					)
				this.manaBar.clear()
				this.manaBar.lineStyle(1, COLOR, ALPHA)
				this.manaBar.beginFill(COLOR, ALPHA)
				this.manaBar.drawRect(0, 0, (this.amount / this.MANA_MAX * MANA_BAR_WIDTH) |0, scoreFontSize.HEIGHT - GAP * 2)
				this.manaBar.endFill()
			}
			this.updateManaBar()
		}

		this.scrolls = game.add.group()
		this.counterblows = game.add.group()

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
		).onComplete.add(() => this.createBullet(
			this.spike.world.x + 13,
			this.spike.world.y + 4,
			'lvl1',
			'scroll',
		))

		this.mobs = new Map()
		for (let mobType in world.lvl1) {
			this.mobs.set(mobType, game.add.group(undefined, mobType))
			let mobParams = world.lvl1[mobType]
			mobParams.coords.forEach((coords) => this.spawnMob(
				mobType,
				coords,
				mobParams.health,
				mobParams.score
			))
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
			tab: game.input.keyboard.addKey(Phaser.KeyCode.TAB),
			shift: game.input.keyboard.addKey(Phaser.KeyCode.SHIFT),
			w: game.input.keyboard.addKey(Phaser.KeyCode.W),
			a: game.input.keyboard.addKey(Phaser.KeyCode.A),
			s: game.input.keyboard.addKey(Phaser.KeyCode.S),
			d: game.input.keyboard.addKey(Phaser.KeyCode.D)
		})
		game.input.keyboard.addKey(Phaser.KeyCode.Z).onUp.add(() => game.sound.mute = !game.sound.mute)
	}

	update = (game) => {
		if (this.gameOver) return
		let wasMovedX = false

		// keyboard
		if (this.input.up.isDown || this.input.w.isDown) {
			this.twilightWing.scale.y = -1
			this._setIf((y) => y-=2, (y) => y > fieldBounds.UP, this.twilight.cameraOffset, 'y')
		} else if (this.input.down.isDown || this.input.s.isDown) {
			this.twilightWing.scale.y = 1
			this._setIf((y) => y+=2, (y) => y < fieldBounds.BOTTOM - 19, this.twilight.cameraOffset, 'y')
		} else if (this.input.left.isDown || this.input.a.isDown) {
			this._setIf((x) => x-=2, (x) => x > fieldBounds.LEFT, this.twilight.cameraOffset, 'x')
			wasMovedX = true
		} else if (this.input.right.isDown || this.input.d.isDown) {
			this._setIf((x) => x+=2, (x) => x < fieldBounds.RIGHT - 30, this.twilight.cameraOffset, 'x')
			wasMovedX = true
		} else if (this.input.space.isDown || this.input.enter.isDown) {
			this.spikePaw.animations.play('throw')
		} else if (this.input.tab.isDown || this.input.shift.isDown) {
			if (this.mana.amount >= this.mana.MANA_MAX) {
				this.activateField('attack')
			} else if (this.mana.amount >= this.mana.MANA_MAX / 3) {
				this.activateBeam()
			}
		}

		// collisions
		for (let [mobType, mobGroup] of this.mobs) {
			if (this.protectionField) {
				game.physics.arcade.collide(this.protectionField, mobGroup, (field, mob) => {
					if (mob.parent.name != 'tiret') {
						this.killMob(mob)
					}
				})
			}

			if (this.beam) {
				game.physics.arcade.collide(this.beam, mobGroup, (beam, mob) => {
					this._mobDamage(mob, mobType, 0.3)
				})
			}

			game.physics.arcade.collide(mobGroup, this.scrolls, (mob, scroll) => {
				this._mobDamage(mob, mobType, 1)
				scroll.kill()
			}, null, this)
			if (!this.protectionField) {
				game.physics.arcade.collide(this.twilightBody, mobGroup, (twi, mob) => {
					if (mob.parent.name != 'tiret') {
						this.killMob(mob)
					}
					this.health.damage()
				})
				game.physics.arcade.collide(this.twilightBody, this.counterblows, (twi, bullet) => {
					bullet.kill()
					this.health.damage()
				})
			}
		}

		// mana
		const oldMana = this.mana.amount
		if (this.protectionField && this.protectionFieldMode === 'attack') {
			this.mana.amount -= 5
			if (this.mana.amount <= 0) {
				this.destroyField()
			}
		}
		if (this.beam) {
			this.mana.amount -= 5
			if (this.beamThreshold > this.mana.amount) {
				this.destroyBeam()
			}
		}
		if (this.mana.amount < this.mana.MANA_MAX) {
			this.mana.amount ++
		}
		if (oldMana !== this.mana.amount) {
			this.mana.updateManaBar()
		}
		if (this.beam && (wasMovedX || this.beam.width === 1)) {
			this.updateBeam()
		}
	}

	_setIf = (action, predicate, object, property) => {
		let updated = action(object[property])
		if (predicate(updated))
			object[property] = updated
	}

	createBullet = (...args) => {
		const [ x, y, level, type ] = args

		const isScroll = type === 'scroll'
		const bullet = this[isScroll ? 'scrolls' : 'counterblows'].create(...args)

		this.game.physics.arcade.enable(bullet)

		bullet.events.onKilled.add(() => this._removeTimer(), this)

		const bulletDestroy = () => {
			bullet.destroy()
			this._removeTimer(timer)
		}

		const scrollUpdater = () => bullet.position.x - this.game.camera.x < fieldBounds.RIGHT
			? bullet.position.x+=2
			: bulletDestroy()
		const counterblowUpdater = () => bullet.position.x - this.game.camera.x > fieldBounds.LEFT
			? bullet.position.x-=3
			: bulletDestroy()

		const timer = this.game.time.events.loop(
			Phaser.Timer.SECOND / 60,
			isScroll ? scrollUpdater : counterblowUpdater,
		)
	}

	_removeTimer = (timer) => this.game.time.events.remove(timer)

	_onResize = () => {
		let scaleFactor = Math.min(window.innerWidth/fieldSize.WIDTH, window.innerHeight/fieldSize.HEIGHT)|0
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
		this.game.scale.setUserScale(scaleFactor, scaleFactor, 0, 0)
	}

	spawnMob = (mobType, coords, health, score) => {
		let mob = this.mobs.get(mobType).create(coords.x, coords.y, 'lvl1', mobType + '00')
		mob.health = health
		mob.maxHealth = health
		mob.score = score
		if (mobType == 'tiret') {
			let phase
			let timer = this.game.time.events.loop(
				Phaser.Timer.SECOND * 0.05,
				() => {
					if (!mob.alive) {
						this._removeTimer(timer)
						return
					}
					if (mob.y <= 20) {
						phase = 1
					} else if (mob.y >= 70) {
						phase = -1
					}
					if (mob.inCamera && Math.random() < 0.05) {
						this.createBullet(
							mob.world.x + mob.width / 2,
							randGen.between(mob.y + 20, mob.bottom - 20),
							'lvl1',
							'tiretSplash00',
						)
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
		this.score.add(mob.score)
		if (mob.parent.name == 'tiret') {
			this.gameOver = true
			this.win = true
			this.onGameOver()
		}
	}

	_mobDamage = (mob, mobType, amount) => {
		const game = this.game
		if (mob.health - 0.01 > amount) {
			mob.damage(amount)
			if (!mobType.indexOf('parasprite')) {
				game.time.events.add(
					Phaser.Timer.SECOND * 2,
					() => {
						if (mob.alive) {
							game.physics.arcade.enable([
								this.spawnMob(
									mob.parent.name,
									{ x: mob.x, y: mob.y-10 },
									mob.maxHealth,
									mob.score,
								),
								this.spawnMob(
									mob.parent.name,
									{ x: mob.x, y: mob.y+10 },
									mob.maxHealth,
									mob.score,
								),
							])
							mob.destroy()
						}
					}
				)
			}
		} else {
			this.killMob(mob)
		}
	}

	onGameOver = () => {}

	activateField = (mode) => {
		if (this.beam) {
			return
		}

		if (this.protectionField) {
			this.destroyField()
		}

		this.protectionFieldMode = mode

		this.protectionField = this.game.add.sprite(-4, -8, 'lvl1', 'protectionField00')
		this.game.physics.arcade.enable(this.protectionField)
		this.protectionField.body.setCircle(22.5, 0, 0)
		this.protectionField.body.immovable = true

		this.twilight.addChild(this.protectionField)

		if (mode === 'defense') {
			this.game.time.events.add(
				Phaser.Timer.SECOND * 3,
				this.destroyField,
			)
		}
	}

	destroyField = () => {
		if (this.protectionField) {
			this.protectionField.kill()
			delete this.protectionField
			delete this.protectionFieldMode
		}
	}

	activateBeam = () => {
		if (this.protectionField || this.beam) {
			return
		}

		this.beam = this.game.add.tileSprite(36, 0, 1, 4, 'lvl1', 'beam00')
		this.game.physics.arcade.enable(this.beam)

		this.twilight.addChild(this.beam)

		this.beamThreshold = this.mana.amount - this.mana.MANA_MAX / 3
		if (this.beamThreshold < 0) {
			this.beamThreshold = 0
		}
	}

	updateBeam = () => {
		if (this.beam) {
			if (this.beam.position.x !== this.beam.world.x) {
				this.beam.width = fieldSize.WIDTH - (this.beam.world.x - this.game.camera.x)
				this.beam.body.setSize(this.beam.width, this.beam.height)
			}
		}
	}

	destroyBeam = () => {
		if (this.beam) {
			this.beam.kill()
			delete this.beam
			delete this.beamThreshold
		}
	}
}

export default SpikeImpactGame
