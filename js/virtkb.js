import Phaser from 'phaser'

let keyboard = null
if ('ontouchstart' in window) {
	let touchKeys = document.getElementById('touchKeys')
	touchKeys.style.display = 'block'

	let classMappings = {
		up: Phaser.KeyCode.UP,
		down: Phaser.KeyCode.DOWN,
		bonus: Phaser.KeyCode.TAB,
		left: Phaser.KeyCode.LEFT,
		right: Phaser.KeyCode.RIGHT,
		shoot: Phaser.KeyCode.SPACEBAR
	}

	let kbHandler = (e) => {
		let keyCode = 0
		for (let className in classMappings)
			if (e.target.classList.contains(className)) {
				keyCode = classMappings[className]
				break
			}

		keyboard[e.type == 'touchstart' ? 'processKeyDown' : 'processKeyUp']({
			keyCode,
			preventDefault: () => {}
		})

		e.type == 'touchstart'
		?	e.target.classList.add('active')
		:	e.target.classList.remove('active')

		e.preventDefault()
	}

	for (let key of document.querySelectorAll('#touchKeys .block > *')) {
		key.addEventListener('touchstart', kbHandler)
		key.addEventListener('touchend', kbHandler)
		key.addEventListener('dblclick', (e) => e.preventDefault())
	}
}

let bindPhaser = (game) => {
	keyboard = game.input.keyboard
}

export default bindPhaser
