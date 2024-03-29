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
const MOB_Y_GAP = 20

const randGen = new Phaser.RandomDataGenerator()

const getAnimationGenerator = (coord, width, height) => {
	const { x: x, y: y, animation: animation } = coord
	const [ func, axis ] = animation.split('-')
	let phase = 1
	const GAP_BOTTOM = fieldSize.HEIGHT - height - MOB_Y_GAP

	if (axis === 'x') {
		return (x, y) => ({ x, y })
	} else {
		return (x, y) => {
			if (y <= MOB_Y_GAP) {
				phase = 1
			} else if (y >= GAP_BOTTOM) {
				phase = -1
			}
			return { x, y: y + phase }
		}
	}
}

class SpikeImpactGame {
	constructor() {
		this.game = new Phaser.Game(
			fieldSize.WIDTH,
			fieldSize.HEIGHT,
			Phaser.AUTO,
			document.getElementById('viewport'),
			{
				create: this.initGame,
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
		game.load.audio('bgmusic2', 'snd/bgmusic2.ogg')
		game.load.audio('bgmusic3', 'snd/bgmusic3.ogg')
		game.load.image('scoreFont', 'img/scoreFont.gif')
	}

	initGame = (game) => {
		this.gameOver = false
		this.win = false
		this.winLvl = false

		window.addEventListener('resize', this._onResize)
		this._onResize()

		game.physics.startSystem(Phaser.Physics.ARCADE)
		game.stage.smoothed = false

		this.health = new (function(_this) {
			const setText = (text) => text ? this.font.setText(text, false, 1) : this.font.clear()
			const updateText = () => setText('*'.repeat(health))

			let health = 2
			let accel = 1

			this.damage = () => {
				if (--health > 0) {
					_this.twilight.cameraOffset.x = 30
					_this.twilight.cameraOffset.y = 30
					_this.activateField('defense')
					_this.destroyBeam()
				} else {
					_this.gameOver = true
					game.time.events.loop(
						Phaser.Timer.SECOND * 0.05,
						() => _this.twilight.cameraOffset.y += (accel++)
					)
					_this._clearTimers()
					health = 0
					_this.onGameOver()
				}
				updateText()
			}

			this.heal = () => {
				health++
				updateText()
			}

			this.font = game.add.retroFont('scoreFont', scoreFontSize.WIDTH, scoreFontSize.HEIGHT, '*', 1, 1, 0, 65)
			updateText()

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

		this.soundIndicator = new (function(_this) {
			this.font = game.add.retroFont('scoreFont', 6, 7, '10', 2, 1, 0, 70)
			this.font.setText('1')

			this.text = game.add.image(280, TOP_BAR_Y_OFFSET, this.font)
			this.text.fixedToCamera = true

			_this.game.sound.onMute.add(() => this.font.setText('0'))
			_this.game.sound.onUnMute.add(() => this.font.setText('1'))
		})(this)

		this.initLvl1(game)

		this._setupKeyboard(game)

		document.querySelector('#viewport .loader').style.display = 'none'
	}

	initLvl1 = (game) => {
		this.currentLevel = 1

		this._initLvlGeneric(game)

		game.stage.backgroundColor = '#587373'

		game.world.setBounds(0, 0, 1800, fieldSize.HEIGHT)

		this._initTwilight(game)

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

		this.timers.push(game.time.events.loop(Phaser.Timer.SECOND * 0.05, () => game.camera.x++))

		this.sound = game.add.sound('bgmusic', 1, true)
		this.sound.play()
	}

	initLvl2 = (game) => {
		this.currentLevel = 2

		this._initLvlGeneric(game)

		game.stage.backgroundColor = '#735858'

		game.world.setBounds(0, 0, 2100, fieldSize.HEIGHT)

		this._initTwilight(game)

		this.mobs = new Map()
		for (let mobType in world.lvl2) {
			this.mobs.set(mobType, game.add.group(undefined, mobType))
			let mobParams = world.lvl2[mobType]
			mobParams.coords.forEach((coords) => this.spawnMob(
				mobType,
				coords,
				mobParams.health,
				mobParams.score
			))
		}
		this.mobs.set('voice', game.add.group(undefined, 'voice'))

		game.physics.arcade.enable([...this.mobs.values()])

		this.timers.push(game.time.events.loop(Phaser.Timer.SECOND * 0.05, () => game.camera.x++))

		this.sound = game.add.sound('bgmusic2', 1, true)
		this.sound.play()
	}

	initLvl3 = (game) => {
		this.currentLevel = 3

		this._initLvlGeneric(game)

		game.stage.backgroundColor = '#331818'

		game.world.setBounds(0, 0, 2100, fieldSize.HEIGHT)

		this._initTwilight(game)

		this.mobs = new Map()
		for (let mobType in world.lvl3) {
			this.mobs.set(mobType, game.add.group(undefined, mobType))
			let mobParams = world.lvl3[mobType]
			mobParams.coords.forEach((coords) => this.spawnMob(
				mobType,
				coords,
				mobParams.health,
				mobParams.score
			))
		}
		this.mobs.set('yoba', game.add.group(undefined, 'yoba'))

		game.physics.arcade.enable([...this.mobs.values()])

		this.timers.push(game.time.events.loop(Phaser.Timer.SECOND * 0.05, () => game.camera.x++))

		this.sound = game.add.sound('bgmusic3', 1, true)
		this.sound.play()
	}

	_initLvlGeneric = (game) => {
		this.winLvl = false

		this.scrolls = game.add.group()
		this.counterblows = game.add.group()
		this.activeCounterblows = game.add.group()

		this.timers = []

		game.camera.x = 0
	}

	_clearTimers = () => this.timers.forEach((timer) => this._removeTimer(timer))

	destroyLvl = () => {
		this.twilight.destroy()
		this.scrolls.destroy()
		this.counterblows.destroy()
		this.activeCounterblows.destroy()
		this.mobs.forEach((group) => group.destroy())
		this._clearTimers()
		this.sound.destroy()
	}

	animatedNextLvl = () => {
		let accel = 1
		this.winLvl = true

		const timer = this.game.time.events.loop(
			Phaser.Timer.SECOND * 0.05,
			() => {
				this.twilight.cameraOffset.x += (accel += 0.5)
				if (this.twilight.cameraOffset.x > fieldSize.WIDTH) {
					this._removeTimer(timer)
					this.nextLvl()
				}
			},
			this
		)
	}

	nextLvl = () => {
		if (this.currentLevel === 1) {
			this.destroyLvl()
			this.initLvl2(this.game)
		} else if (this.currentLevel === 2) {
			this.destroyLvl()
			this.initLvl3(this.game)
		} else if (this.currentLevel === 3) {
			this.win = true
			this.gameOver = true
			this._clearTimers()
			this.onGameOver()
		}
	}

	_initTwilight = (game) => {
		this.twilight = game.add.sprite(30, 30, 'lvl1', 'dummy')

		this.spike = game.add.sprite(15, 0, 'lvl1', 'dummy')

		this.spikePaw = game.add.sprite(1, 3, 'lvl1', 'dummy')
		this.spikeBody = game.add.sprite(0, 0, 'lvl1', 'spikeBody00')
		this.spike.addChild(this.spikePaw)
		this.spike.addChild(this.spikeBody)

		this.twilightBody = game.add.sprite(0, 0, 'lvl1', 'twilightBody')
		this.twilightWing = game.add.sprite(9, 18, 'lvl1', 'twilightWing')

		this.twilightWing.anchor.setTo(0, 1)
		this.timers.push(game.time.events.loop(Phaser.Timer.SECOND * 0.4, () => this.twilightWing.scale.y = -this.twilightWing.scale.y))

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

		game.physics.arcade.enable(this.twilightBody)
	}

	_setupKeyboard = (game) => {
		this.input = Object.assign(game.input.keyboard.createCursorKeys(), {
			one: game.input.keyboard.addKey(Phaser.KeyCode.ONE),
			three: game.input.keyboard.addKey(Phaser.KeyCode.THREE),
			four: game.input.keyboard.addKey(Phaser.KeyCode.FOUR),
			six: game.input.keyboard.addKey(Phaser.KeyCode.SIX),
			eight: game.input.keyboard.addKey(Phaser.KeyCode.EIGHT),
			zero: game.input.keyboard.addKey(Phaser.KeyCode.ZERO),
			seven: game.input.keyboard.addKey(Phaser.KeyCode.SEVEN),
			nine: game.input.keyboard.addKey(Phaser.KeyCode.NINE),
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

	_isProtected = () => this.protectionField || this.winLvl

	update = (game) => {
		if (this.gameOver) return
		let wasMovedX = false

		// keyboard
		if (this.input.up.isDown || this.input.w.isDown || this.input.eight.isDown) {
			this.twilightWing.scale.y = -1
			this._setIf((y) => y-=2, (y) => y > fieldBounds.UP, this.twilight.cameraOffset, 'y')
		} else if (this.input.down.isDown || this.input.s.isDown || this.input.zero.isDown) {
			this.twilightWing.scale.y = 1
			this._setIf((y) => y+=2, (y) => y < fieldBounds.BOTTOM - 19, this.twilight.cameraOffset, 'y')
		} else if (this.input.left.isDown || this.input.a.isDown || this.input.seven.isDown) {
			this._setIf((x) => x-=2, (x) => x > fieldBounds.LEFT, this.twilight.cameraOffset, 'x')
			wasMovedX = true
		} else if (this.input.right.isDown || this.input.d.isDown || this.input.nine.isDown) {
			this._setIf((x) => x+=2, (x) => x < fieldBounds.RIGHT - 30, this.twilight.cameraOffset, 'x')
			wasMovedX = true
		} else if (this.input.space.isDown || this.input.enter.isDown || this.input.one.isDown || this.input.three.isDown) {
			this.spikePaw.animations.play('throw')
		} else if (this.input.tab.isDown || this.input.shift.isDown || this.input.four.isDown || this.input.six.isDown) {
			if (this.mana.amount >= this.mana.MANA_MAX) {
				this.activateField('attack')
			} else if (this.mana.amount >= this.mana.MANA_MAX / 3) {
				this.activateBeam()
			}
		}

		// collisions
		const fieldDamage = (field, mob) => {
			if (!this._isBoss(mob.parent.name)) {
				this.killMob(mob)
			}
		}
		const beamDamage = (beam, mob) => {
			if (!this._isGem(mob.parent.name)) {
				this._mobDamage(mob, 0.3)
			}
		}
		const scrollDamage = (mob, scroll) => {
			if (!this._isGem(mob.parent.name)) {
				this._mobDamage(mob, 1)
				scroll.kill()
			}
		}
		const mobDamage = (twi, mob) => {
			if (!this._isBoss(mob.parent.name)) {
				this.killMob(mob)
			}
			if (!this._isProtected() && !this._isGem(mob.parent.name)) {
				this.health.damage()
			}
		}
		const mobGroupCollisions = (mobGroup) => {
			if (this.protectionField) {
				game.physics.arcade.collide(this.protectionField, mobGroup, fieldDamage)
			}

			if (this.beam) {
				game.physics.arcade.collide(this.beam, mobGroup, beamDamage)
			}

			game.physics.arcade.collide(mobGroup, this.scrolls, scrollDamage, null, this)

			if (!this._isProtected()) {
				game.physics.arcade.collide(this.twilightBody, mobGroup, mobDamage)
			}
		}

		for (let [mobType, mobGroup] of this.mobs) {
			mobGroupCollisions(mobGroup)
		}
		mobGroupCollisions(this.activeCounterblows)
		game.physics.arcade.collide(
			this.twilightBody,
			[ this.counterblows, this.activeCounterblows, ],
			(twi, bullet) => {
				bullet.kill()
				if (!this._isProtected()) {
					this.health.damage()
				}
			}
		)

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
				? bullet.position.x-=2
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

	_isBoss = (name) => name === 'tiret' || name === 'discord' || name === 'akio'

	_isGem = (name) => name === 'gem'

	spawnMob = (mobType, coords, health, score) => {
		const isBoss = this._isBoss(mobType)

		let mob = this.mobs.get(mobType).create(coords.x, coords.y, 'lvl1', mobType + '00')
		mob.health = health
		mob.maxHealth = health
		mob.score = score

		if (isBoss || coords.defense) {
			mob.autoCull = true
		}

		const animation = coords.animation ? getAnimationGenerator(coords, mob.width, mob.height) : null

		if (animation || isBoss) {
			let phase = 0
			const PHASE_BOSS_ATTACK_THRESHOLD = 425
			const PHASE_BOSS_RETURN_THRESHOLD = 450
			const PHASE_RESET_THRESHOLD = mobType === 'akio' ? 500 : 400
			let timer = this.game.time.events.loop(
				Phaser.Timer.SECOND * 0.05,
				() => {
					if (!mob.alive) {
						this._removeTimer(timer)
						return
					}
					if (isBoss && mob.inCamera) {
						let counterblowX, counterblowY
						if (mobType === 'akio') {
							const plTint = 0xe3fff5
							const plBlendMode = Phaser.PIXI.blendModes.SCREEN
							if (this.twilightBody.tint !== plTint) {
								this.twilightBody.tint = plTint
								this.twilightBody.blendMode = plBlendMode
								this.twilightWing.tint = plTint
								this.twilightWing.blendMode = plBlendMode
							}

							counterblowX = mob.world.x - 11
							counterblowY = mob.world.y + 10
						} else {
							counterblowX = mob.world.x + mob.width / 2
							counterblowY = randGen.between(mob.y + 20, mob.bottom - 20)
						}

						if (mobType === 'tiret') {
							if (Math.random() < 0.05) {
								this.createBullet(
									counterblowX,
									counterblowY,
									'lvl1',
									'tiretSplash00',
								)
							}
						} else {
							if (++phase >= PHASE_RESET_THRESHOLD) {
								phase = 0
							}
							if (!(phase % 20) && phase < PHASE_BOSS_ATTACK_THRESHOLD) {
								this.game.physics.arcade.enable(this.spawnMob(
									mobType === 'discord' ? 'voice' : 'yoba',
									{ x: counterblowX, y: counterblowY },
									2,
									0,
								))
							}
							if (phase >= PHASE_BOSS_RETURN_THRESHOLD) {
								mob.x += 3
							} else if (phase >= PHASE_BOSS_ATTACK_THRESHOLD) {
								mob.x -= 6
							}
						}
					}
					if (animation && phase < PHASE_BOSS_ATTACK_THRESHOLD) {
						let { x, y } = animation(mob.x, mob.y)
						mob.x = x
						mob.y = y
					}
				}
			)
		} else {
			const isActive = mobType === 'voice' || mobType === 'yoba'
			if (isActive) {
				const timer = this.game.time.events.loop(
					Phaser.Timer.SECOND / 60,
					() => {
						if (!mob.alive) {
							this._removeTimer(timer)
							return
						}

						const speed = 1
						mob.x -= speed

						const yDiff = this.twilight.cameraOffset.y - mob.y
						if (yDiff >= 1) {
							mob.y += speed
						} else if (yDiff <= -1) {
							mob.y -= speed
						}
					},
				)
			}
			if (coords.defense) {
				const phaseMax = 1000
				let phase = (Math.random() * 1000) | 0
				const timer = this.game.time.events.loop(
					Phaser.Timer.SECOND / 60,
					() => {
						if (!mob.alive) {
							this._removeTimer(timer)
							return
						}

						if (++phase >= 1000) {
							phase = 0
						}
						if (mob.inCamera && !phase) {
							this.createBullet(
								mob.world.x - 10,
								mob.y,
								'lvl1',
								'tiretSplash00',
							)
						}
					},
				)
			}
		}

		if (!isBoss) {
			mob.animations.add(mobType + 'Fly', Phaser.Animation.generateFrameNames(mobType, 0, 1, '', 2))
			mob.animations.play(mobType + 'Fly', 2, true)
		}
		return mob
	}

	killMob = (mob) => {
		mob.kill()
		const name = mob.parent.name
		if (this._isGem(name)) {
			if (Math.random() < 0.5) {
				this.health.heal()
			} else {
				this.mana.amount = this.mana.MANA_MAX
				this.mana.updateManaBar()
			}
		} else {
			this.score.add(mob.score)
			if (this._isBoss(name)) {
				this.animatedNextLvl()
			}
		}
	}

	_mobDamage = (mob, amount) => {
		const game = this.game
		if (mob.health - 0.01 > amount) {
			mob.damage(amount)
			const mobType = mob.parent.name
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
		if (this.beam && this.beam.body) {
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
