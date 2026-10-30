const boardElement = document.getElementById('game-board');
const boardStageElement = document.getElementById('board-stage');
const sourceMarkerElement = document.getElementById('source-marker');
const destinationMarkerElement = document.getElementById('destination-marker');
const levelNumberElement = document.getElementById('level-number');
const fieldLabelElement = document.getElementById('field-label');
const bestTimeElement = document.getElementById('best-time');
const pollutionHintElement = document.getElementById('pollution-hint');
const scoreElement = document.getElementById('score-value');
const scoreBonusElement = document.getElementById('score-bonus');
const cleanupCanCountElement = document.getElementById('cleanup-can-count');
const cleanupCanButtons = Array.from(document.querySelectorAll('.cleanup-can'));
const timerValueElement = document.getElementById('timer-value');
const timerBarElement = document.getElementById('timer-bar');
const timerElement = document.getElementById('timer');
const levelProgressElement = document.getElementById('level-progress');
const statusElement = document.getElementById('game-status');
const statusMessageElement = document.getElementById('status-message');
const releaseButton = document.getElementById('release-button');
const resetButton = document.getElementById('reset-button');
const nextButton = document.getElementById('next-button');
const nextButtonLabelElement = document.getElementById('next-button-label');
const musicToggleButton = document.getElementById('music-toggle');
const musicStateElement = document.getElementById('music-state');
const recordDialog = document.getElementById('record-dialog');
const recordDialogLevelElement = document.getElementById('record-dialog-level');
const recordDialogTimeElement = document.getElementById('record-dialog-time');
const recordDialogPreviousElement = document.getElementById('record-dialog-previous');

const boardSize = 5;
const source = { row: 2, col: -1 }; // Aligning with centered row for expanded maps
const directionOrder = ['N', 'E', 'S', 'W'];
const directionOffsets = {
	N: { row: -1, col: 0 },
	E: { row: 0, col: 1 },
	S: { row: 1, col: 0 },
	W: { row: 0, col: -1 }
};
const directionPoints = {
	N: { left: '50%', top: '10%' },
	E: { left: '90%', top: '50%' },
	S: { left: '50%', top: '90%' },
	W: { left: '10%', top: '50%' }
};
const oppositeDirection = { N: 'S', E: 'W', S: 'N', W: 'E' };
const obstaclePenalty = 100;
const cleanupCanBonus = 50;
const obstacleMoveEverySeconds = 5;
const obstacleMoveAfterInteractionSeconds = 2;
const levelCompletionBonus = 300;
const bestTimesStorageKey = 'waterWorksBestTimes';

// Each pipe's starting rotation is the puzzle state players see at the start.
const levels = [
	{
		time: 60,
		pipes: [
			{ row: 2, col: 0, type: 'corner', rotation: 0 },
			{ row: 1, col: 0, type: 'straight', rotation: 0 },
			{ row: 0, col: 0, type: 'corner', rotation: 0 },
			{ row: 0, col: 1, type: 'straight', rotation: 0 },
			{ row: 0, col: 2, type: 'corner', rotation: 0 },
			{ row: 1, col: 2, type: 'straight', rotation: 0 },
			{ row: 2, col: 2, type: 'corner', rotation: 0 },
			{ row: 2, col: 3, type: 'straight', rotation: 0 },
			{ row: 2, col: 4, type: 'straight', rotation: 0 }
		]
	},
	{
		time: 55,
		destination: { row: 1, col: 5 },
		obstacles: [{ row: 0, col: 0 }],
		obstaclePath: [
			[{ row: 0, col: 0 }],
			[{ row: 0, col: 1 }],
			[{ row: 0, col: 2 }],
			[{ row: 0, col: 3 }],
			[{ row: 0, col: 4 }],
			[{ row: 2, col: 1 }],
			[{ row: 4, col: 1 }],
			[{ row: 4, col: 4 }]
		],
		pipes: [
			{ row: 2, col: 0, type: 'corner', rotation: 0 },
			{ row: 1, col: 0, type: 'corner', rotation: 0 },
			{ row: 1, col: 1, type: 'straight', rotation: 0 },
			{ row: 1, col: 2, type: 'corner', rotation: 0 },
			{ row: 2, col: 2, type: 'straight', rotation: 0 },
			{ row: 2, col: 3, type: 'straight', rotation: 0 },
			{ row: 3, col: 2, type: 'corner', rotation: 0 },
			{ row: 3, col: 3, type: 'straight', rotation: 0 },
			{ row: 3, col: 4, type: 'corner', rotation: 0 },
			{ row: 2, col: 4, type: 'straight', rotation: 0 },
			{ row: 1, col: 4, type: 'corner', rotation: 0 }
		]
	},
	{
		time: 65,
		destination: { row: 4, col: 5 },
		obstacles: [{ row: 0, col: 0 }],
		obstaclePath: [
			[{ row: 0, col: 0 }],
			[{ row: 0, col: 1 }],
			[{ row: 0, col: 2 }],
			[{ row: 0, col: 3 }],
			[{ row: 0, col: 4 }],
			[{ row: 1, col: 0 }],
			[{ row: 1, col: 1 }],
			[{ row: 2, col: 1 }],
			[{ row: 4, col: 0 }],
			[{ row: 4, col: 1 }],
			[{ row: 4, col: 2 }],
			[{ row: 4, col: 3 }]
		],
		pipes: [
			{ row: 2, col: 0, type: 'corner', rotation: 0 },
			{ row: 3, col: 0, type: 'corner', rotation: 0 },
			{ row: 3, col: 1, type: 'straight', rotation: 0 },
			{ row: 3, col: 2, type: 'corner', rotation: 0 },
			{ row: 2, col: 2, type: 'straight', rotation: 0 },
			{ row: 1, col: 2, type: 'corner', rotation: 0 },
			{ row: 1, col: 3, type: 'straight', rotation: 0 },
			{ row: 1, col: 4, type: 'corner', rotation: 0 },
			{ row: 2, col: 4, type: 'straight', rotation: 0 },
			{ row: 3, col: 4, type: 'straight', rotation: 0 },
			{ row: 4, col: 4, type: 'corner', rotation: 0 }
		]
	}
];

let currentLevelIndex = 0;
let activePipes = [];
let activeObstacles = [];
let flowingPipes = [];
let timeLeft = 0;
let obstaclePathIndex = 0;
let obstacleMoveCountdown = obstacleMoveEverySeconds;
let lastInteractedPipe = null;
let score = 300;
let collectedCans = [];
let bestTimes = readBestTimes();
let scoreBonusTimeout = null;
let confettiLayer = null;
let confettiTimeout = null;
let timerInterval = null;
let levelIsOver = false;
let audioContext = null;
let musicInterval = null;
let flowSoundTimeout = null;
let musicEnabled = true;
let musicNoteIndex = 0;

function getPipePorts(pipe) {
	const startingPorts = pipe.type === 'straight' ? ['N', 'S'] : ['N', 'E'];

	return startingPorts.map((direction) => {
		const directionIndex = directionOrder.indexOf(direction);
		return directionOrder[(directionIndex + pipe.rotation) % directionOrder.length];
	});
}

function readBestTimes() {
	try {
		const savedBestTimes = window.localStorage.getItem(bestTimesStorageKey);
		const parsedBestTimes = JSON.parse(savedBestTimes || '{}');
		return parsedBestTimes && typeof parsedBestTimes === 'object' ? parsedBestTimes : {};
	} catch {
		return {};
	}
}

function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateBestTimeDisplay() {
	const bestTime = bestTimes[currentLevelIndex];
	bestTimeElement.textContent = Number.isInteger(bestTime) ? formatTime(bestTime) : '--:--';
}

function saveBestTime(elapsedSeconds) {
	const currentBest = bestTimes[currentLevelIndex];
	if (Number.isInteger(currentBest) && currentBest <= elapsedSeconds) {
		return { isNewRecord: false, previousBest: currentBest };
	}

	bestTimes[currentLevelIndex] = elapsedSeconds;
	try {
		window.localStorage.setItem(bestTimesStorageKey, JSON.stringify(bestTimes));
	} catch {
		// The current session still shows the record if browser storage is unavailable.
	}
	return { isNewRecord: true, previousBest: currentBest };
}

function showNewRecordDialog(elapsedSeconds, previousBest) {
	recordDialogLevelElement.textContent = `LEVEL ${String(currentLevelIndex + 1).padStart(2, '0')}`;
	recordDialogTimeElement.textContent = formatTime(elapsedSeconds);
	recordDialogPreviousElement.textContent = Number.isInteger(previousBest)
		? `Previous best: ${formatTime(previousBest)}`
		: 'First record for this level!';
	recordDialog.showModal();
}

function getPipeAt(row, col) {
	return activePipes.find((pipe) => pipe.row === row && pipe.col === col);
}

function getObstacleAt(row, col) {
	return activeObstacles.find((obstacle) => obstacle.row === row && obstacle.col === col);
}

function getDestination() {
	return levels[currentLevelIndex].destination || { row: source.row, col: boardSize };
}

function makePipeButton(pipe) {
	const button = document.createElement('button');
	button.className = `pipe-piece pipe-${pipe.type}`;
	button.type = 'button';
	button.dataset.row = pipe.row;
	button.dataset.col = pipe.col;
	button.dataset.turn = pipe.rotation;
	button.setAttribute('aria-label', `Turn pipe at row ${pipe.row + 1}, column ${pipe.col + 1}`);
	if (levels[currentLevelIndex].obstaclePath && lastInteractedPipe && !levelIsOver
		&& lastInteractedPipe.row === pipe.row && lastInteractedPipe.col === pipe.col) {
		button.classList.add('is-pollution-target');
	}

	const shape = document.createElement('span');
	shape.className = 'pipe-shape';
	shape.setAttribute('aria-hidden', 'true');

	for (const direction of directionOrder) {
		const arm = document.createElement('span');
		arm.className = `pipe-arm arm-${direction.toLowerCase()}`;
		shape.append(arm);
	}

	const center = document.createElement('span');
	center.className = 'pipe-center';
	shape.append(center);
	button.append(shape);

	const waterGlint = document.createElement('span');
	waterGlint.className = 'water-glint';
	waterGlint.setAttribute('aria-hidden', 'true');
	button.append(waterGlint);

	button.addEventListener('click', () => {
		if (levelIsOver) {
			return;
		}

	startBackgroundMusic();
		pipe.rotation = (pipe.rotation + 1) % directionOrder.length;
		lastInteractedPipe = { row: pipe.row, col: pipe.col };
		if (levels[currentLevelIndex].obstaclePath) {
			obstacleMoveCountdown = Math.min(obstacleMoveCountdown, obstacleMoveAfterInteractionSeconds);
		}
		renderBoard();
	});

	return button;
}

function renderBoard() {
	boardElement.replaceChildren();

	for (let row = 0; row < boardSize; row += 1) {
		for (let col = 0; col < boardSize; col += 1) {
			const obstacle = getObstacleAt(row, col);
			if (obstacle) {
				const obstacleCell = document.createElement('div');
				obstacleCell.className = 'board-cell obstacle-cell pollution-cell';
				if (obstacle.isMoving) {
					obstacleCell.classList.add('is-moving');
				}
				obstacleCell.setAttribute('role', 'img');
				obstacleCell.setAttribute('aria-label', `Polluted water. Hitting it costs ${obstaclePenalty} liters.`);
				const pollutionMark = document.createElement('span');
				pollutionMark.className = 'pollution-mark';
				pollutionMark.setAttribute('aria-hidden', 'true');
				obstacleCell.append(pollutionMark);
				boardElement.append(obstacleCell);
				continue;
			}

			const pipe = getPipeAt(row, col);
			if (pipe) {
				const pipeButton = makePipeButton(pipe);
				const routeIndex = flowingPipes.findIndex((routePipe) => routePipe.row === row && routePipe.col === col);
				if (routeIndex !== -1 && boardElement.classList.contains('is-flowing')) {
					pipeButton.classList.add('is-flowing-pipe');
					const routePipe = flowingPipes[routeIndex];
					const waterGlint = pipeButton.querySelector('.water-glint');
					waterGlint.style.setProperty('--flow-start-left', directionPoints[routePipe.from].left);
					waterGlint.style.setProperty('--flow-start-top', directionPoints[routePipe.from].top);
					waterGlint.style.setProperty('--flow-end-left', directionPoints[routePipe.to].left);
					waterGlint.style.setProperty('--flow-end-top', directionPoints[routePipe.to].top);
					waterGlint.style.setProperty('--flow-delay', `${routeIndex * 180}ms`);
				}
				boardElement.append(pipeButton);
				continue;
			}

			const emptyCell = document.createElement('div');
			emptyCell.className = 'board-cell empty-cell';
			emptyCell.setAttribute('aria-hidden', 'true');
			boardElement.append(emptyCell);
		}
	}
}

function updateProgress() {
	levelProgressElement.replaceChildren();

	levels.forEach((level, index) => {
		const step = document.createElement('span');
		step.className = 'progress-step';

		if (index < currentLevelIndex) {
			step.classList.add('is-complete');
		}
		if (index === currentLevelIndex) {
			step.classList.add('is-current');
		}

		step.setAttribute('aria-hidden', 'true');
		levelProgressElement.append(step);
	});
}

function updateTimerDisplay() {
	const currentLevel = levels[currentLevelIndex];
	const percentageLeft = (timeLeft / currentLevel.time) * 100;

	timerValueElement.textContent = timeLeft;
	timerBarElement.style.width = `${percentageLeft}%`;
	timerBarElement.style.backgroundColor = timeLeft <= 15 ? 'var(--red)' : 'var(--yellow)';
	timerElement.classList.toggle('is-low', timeLeft <= 15);
}

function updateScore() {
	scoreElement.textContent = String(score).padStart(4, '0');
}

function showScoreBonus(points) {
	scoreBonusElement.textContent = `+${points} L`;
	scoreBonusElement.classList.remove('is-showing');
	void scoreBonusElement.offsetWidth;
	scoreBonusElement.classList.add('is-showing');
	scoreElement.classList.remove('is-bumping');
	void scoreElement.offsetWidth;
	scoreElement.classList.add('is-bumping');
	window.clearTimeout(scoreBonusTimeout);
	scoreBonusTimeout = window.setTimeout(() => {
		scoreBonusElement.textContent = '';
		scoreBonusElement.classList.remove('is-showing');
		scoreElement.classList.remove('is-bumping');
	}, 1200);
}

function collectCan(event) {
	if (levelIsOver) {
		return;
	}

	const canButton = event.currentTarget;
	const canIndex = Number(canButton.dataset.canIndex);
	if (collectedCans.includes(canIndex)) {
		return;
	}

	collectedCans.push(canIndex);
	canButton.hidden = true;
	const cansLeft = cleanupCanButtons.length - collectedCans.length;
	cleanupCanCountElement.textContent = cansLeft === 0 ? 'ALL CLEAR' : `${cansLeft} LEFT`;
	score += cleanupCanBonus;
	updateScore();
	showScoreBonus(cleanupCanBonus);
	setStatus(`Can collected! +${cleanupCanBonus} liters for clean water.`, 'success');
}

function setStatus(message, state) {
	statusMessageElement.textContent = message;
	statusElement.classList.remove('is-success', 'is-error');

	if (state) {
		statusElement.classList.add(`is-${state}`);
	}
}

function movePollution() {
	const obstaclePath = levels[currentLevelIndex].obstaclePath;
	if (!obstaclePath || levelIsOver) {
		return;
	}

	const currentObstacle = activeObstacles[0];
	let nextObstacle = null;

	if (lastInteractedPipe) {
		const nearbyTiles = [
			{ row: lastInteractedPipe.row - 1, col: lastInteractedPipe.col },
			{ row: lastInteractedPipe.row, col: lastInteractedPipe.col + 1 },
			{ row: lastInteractedPipe.row + 1, col: lastInteractedPipe.col },
			{ row: lastInteractedPipe.row, col: lastInteractedPipe.col - 1 }
		].filter((tile) => tile.row >= 0 && tile.row < boardSize && tile.col >= 0 && tile.col < boardSize
			&& !levels[currentLevelIndex].pipes.some((pipe) => pipe.row === tile.row && pipe.col === tile.col));

		nearbyTiles.sort((firstTile, secondTile) => {
			const firstDistance = Math.abs(firstTile.row - currentObstacle.row) + Math.abs(firstTile.col - currentObstacle.col);
			const secondDistance = Math.abs(secondTile.row - currentObstacle.row) + Math.abs(secondTile.col - currentObstacle.col);
			return firstDistance - secondDistance;
		});
		nextObstacle = nearbyTiles.find((tile) => tile.row !== currentObstacle.row || tile.col !== currentObstacle.col);
	}

	if (!nextObstacle) {
		for (let pathStep = 0; pathStep < obstaclePath.length; pathStep += 1) {
			obstaclePathIndex = (obstaclePathIndex + 1) % obstaclePath.length;
			const patrolTile = obstaclePath[obstaclePathIndex][0];
			if (patrolTile.row !== currentObstacle.row || patrolTile.col !== currentObstacle.col) {
				nextObstacle = patrolTile;
				break;
			}
		}
	}

	if (!nextObstacle) {
		return;
	}

	activeObstacles = [{ ...nextObstacle, isMoving: true }];
	renderBoard();
	setStatus('Pollution moved toward the pipe you turned. Watch the hazard.');
}

function loadLevel(levelIndex) {
	window.clearInterval(timerInterval);
	window.clearTimeout(flowSoundTimeout);
	clearConfetti();
	currentLevelIndex = levelIndex;
	levelIsOver = false;
	timeLeft = levels[currentLevelIndex].time;
	activePipes = levels[currentLevelIndex].pipes.map((pipe) => ({ ...pipe }));
	const currentLevel = levels[currentLevelIndex];
	activeObstacles = (currentLevel.obstaclePath ? currentLevel.obstaclePath[0] : currentLevel.obstacles || [])
		.map((obstacle) => ({ ...obstacle }));
	obstaclePathIndex = 0;
	obstacleMoveCountdown = obstacleMoveEverySeconds;
	lastInteractedPipe = null;
	collectedCans = [];
	cleanupCanButtons.forEach((button) => {
		button.hidden = false;
	});
	cleanupCanCountElement.textContent = `${cleanupCanButtons.length} LEFT`;
	flowingPipes = [];
	sourceMarkerElement.style.gridRow = String(source.row + 1);
	destinationMarkerElement.style.gridRow = String(getDestination().row + 1);

	for (let row = 0; row < boardSize; row += 1) {
		for (let col = 0; col < boardSize; col += 1) {
			if (!getPipeAt(row, col) && !getObstacleAt(row, col)) {
				const pipeType = (row + col) % 3 === 0 ? 'corner' : 'straight';
				activePipes.push({ row, col, type: pipeType, rotation: 0 });
			}
		}
	}

	boardElement.classList.remove('is-flowing');
	boardElement.classList.remove('is-celebrating');
	boardElement.classList.remove('is-failed');
	boardStageElement.classList.remove('is-flowing');
	levelNumberElement.textContent = String(currentLevelIndex + 1).padStart(2, '0');
	fieldLabelElement.textContent = `LEVEL 0${currentLevelIndex + 1} / 0${levels.length}`;
	pollutionHintElement.hidden = !levels[currentLevelIndex].obstaclePath;
	updateBestTimeDisplay();
	releaseButton.hidden = false;
	releaseButton.disabled = false;
	nextButton.hidden = true;
	setStatus('The water is waiting.');
	updateProgress();
	updateTimerDisplay();
	renderBoard();

	timerInterval = window.setInterval(() => {
		timeLeft -= 1;
		updateTimerDisplay();
		if (currentLevel.obstaclePath && !levelIsOver) {
			obstacleMoveCountdown -= 1;
			if (obstacleMoveCountdown <= 0) {
				movePollution();
				obstacleMoveCountdown = obstacleMoveEverySeconds;
			}
		}

		if (timeLeft <= 0) {
			endLevelOnTimeout();
		}
	}, 1000);
}

function checkRoute() {
	const visitedPipes = new Set();
	const routePipes = [];
	const destination = getDestination();
	let row = source.row;
	let col = source.col;
	let direction = 'E';

	for (let step = 0; step < boardSize * boardSize; step += 1) {
		const offset = directionOffsets[direction];
		const nextRow = row + offset.row;
		const nextCol = col + offset.col;

		if (getObstacleAt(nextRow, nextCol)) {
			return { isComplete: false, hitObstacle: true, pipes: routePipes };
		}

		if (nextRow === destination.row && nextCol === destination.col) {
			return { isComplete: direction === 'E', hitObstacle: false, pipes: routePipes };
		}

		const pipe = getPipeAt(nextRow, nextCol);
		const pipeKey = `${nextRow}-${nextCol}`;

		if (!pipe || visitedPipes.has(pipeKey)) {
			return { isComplete: false, hitObstacle: false, pipes: routePipes };
		}

		const ports = getPipePorts(pipe);
		const incomingDirection = oppositeDirection[direction];

		if (!ports.includes(incomingDirection)) {
			return { isComplete: false, hitObstacle: false, pipes: routePipes };
		}

		const outgoingDirection = ports.find((port) => port !== incomingDirection);
		if (!outgoingDirection) {
			return { isComplete: false, hitObstacle: false, pipes: routePipes };
		}

		visitedPipes.add(pipeKey);
		routePipes.push({ row: nextRow, col: nextCol, from: incomingDirection, to: outgoingDirection });
		row = nextRow;
		col = nextCol;
		direction = outgoingDirection;
	}

	return { isComplete: false, hitObstacle: false, pipes: routePipes };
}

function getAudioContext() {
	const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextConstructor) {
		return null;
	}

	if (!audioContext) {
		audioContext = new AudioContextConstructor();
	}
	if (audioContext.state === 'suspended') {
		audioContext.resume();
	}
	return audioContext;
}

function playTone(context, frequency, delay, duration, volume, waveform = 'sine') {
	const startTime = context.currentTime + delay;
	const oscillator = context.createOscillator();
	const oscillatorVolume = context.createGain();
	oscillator.type = waveform;
	oscillator.frequency.setValueAtTime(frequency, startTime);
	oscillatorVolume.gain.setValueAtTime(0.0001, startTime);
	oscillatorVolume.gain.exponentialRampToValueAtTime(volume, startTime + 0.04);
	oscillatorVolume.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
	oscillator.connect(oscillatorVolume);
	oscillatorVolume.connect(context.destination);
	oscillator.start(startTime);
	oscillator.stop(startTime + duration + 0.02);
}

function playWaterSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	const startTime = context.currentTime;
	const soundDuration = 2.2;
	const noiseBuffer = context.createBuffer(1, context.sampleRate * soundDuration, context.sampleRate);
	const noiseSamples = noiseBuffer.getChannelData(0);

	for (let index = 0; index < noiseSamples.length; index += 1) {
		noiseSamples[index] = Math.random() * 2 - 1;
	}

	const noiseSource = context.createBufferSource();
	const waterFilter = context.createBiquadFilter();
	const waterVolume = context.createGain();
	noiseSource.buffer = noiseBuffer;
	waterFilter.type = 'lowpass';
	waterFilter.frequency.setValueAtTime(1100, startTime);
	waterVolume.gain.setValueAtTime(0.0001, startTime);
	waterVolume.gain.exponentialRampToValueAtTime(0.035, startTime + 0.2);
	waterVolume.gain.exponentialRampToValueAtTime(0.0001, startTime + soundDuration);
	noiseSource.connect(waterFilter);
	waterFilter.connect(waterVolume);
	waterVolume.connect(context.destination);
	noiseSource.start(startTime);
	noiseSource.stop(startTime + soundDuration);
}

function playVictorySound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	const notes = [659.25, 783.99, 1046.5, 1318.51];
	notes.forEach((frequency, index) => {
		playTone(context, frequency, index * 0.12, 0.24, 0.025, 'triangle');
	});
	playTone(context, 1046.5, 0.5, 0.4, 0.015, 'sine');
	playTone(context, 1318.51, 0.5, 0.4, 0.015, 'sine');
	playTone(context, 1567.98, 0.5, 0.4, 0.015, 'sine');
}

function playMusicNote() {
	if (!musicEnabled) {
		return;
	}

	const context = getAudioContext();
	if (!context) {
		return;
	}

	const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 880, 1046.5, 1318.51, 1046.5, 880, 783.99, 880, 1046.5, 1174.66, 1318.51, 1046.5];
	const bass = [130.81, 174.61, 196, 130.81];
	playTone(context, melody[musicNoteIndex], 0, 0.16, 0.008, 'square');
	if (musicNoteIndex % 4 === 0) {
		playTone(context, bass[musicNoteIndex / 4], 0, 0.45, 0.005, 'triangle');
	}
	musicNoteIndex = (musicNoteIndex + 1) % melody.length;
}

function startBackgroundMusic() {
	if (!musicEnabled || musicInterval !== null || !getAudioContext()) {
		return;
	}

	musicNoteIndex = 0;
	playMusicNote();
	musicInterval = window.setInterval(playMusicNote, 170);
}

function stopBackgroundMusic() {
	window.clearInterval(musicInterval);
	musicInterval = null;
}

function toggleBackgroundMusic() {
	if (!getAudioContext()) {
		return;
	}

	musicEnabled = !musicEnabled;
	musicToggleButton.setAttribute('aria-pressed', String(musicEnabled));
	musicToggleButton.setAttribute('aria-label', `Turn background music ${musicEnabled ? 'off' : 'on'}`);
	musicStateElement.textContent = musicEnabled ? 'MUSIC ON' : 'MUSIC OFF';

	if (musicEnabled) {
		startBackgroundMusic();
	} else {
		stopBackgroundMusic();
	}
}

function releaseWater() {
	if (levelIsOver) {
		return;
	}

	startBackgroundMusic();
	const route = checkRoute();
	if (route.hitObstacle) {
		const litersLost = Math.min(score, obstaclePenalty);
		score -= litersLost;
		updateScore();
		boardElement.classList.add('is-failed');
		setStatus(`Pollution! You lost ${litersLost} liters. Find a cleaner route.`, 'error');
		window.setTimeout(() => boardElement.classList.remove('is-failed'), 700);
		return;
	}

	if (!route.isComplete) {
		boardElement.classList.add('is-failed');
		setStatus('Not quite. The water needs one clear route.', 'error');
		window.setTimeout(() => boardElement.classList.remove('is-failed'), 700);
		return;
	}

	levelIsOver = true;
	window.clearInterval(timerInterval);
	const elapsedSeconds = levels[currentLevelIndex].time - timeLeft;
	const recordResult = saveBestTime(elapsedSeconds);
	updateBestTimeDisplay();
	stopBackgroundMusic();
	playVictorySound();
	flowSoundTimeout = window.setTimeout(playWaterSound, 600);
	score += levelCompletionBonus;
	updateScore();
	showScoreBonus(levelCompletionBonus);
	flowingPipes = route.pipes;
	boardElement.classList.add('is-flowing');
	boardElement.classList.add('is-celebrating');
	boardStageElement.classList.add('is-flowing');
	renderBoard();
	releaseButton.hidden = true;
	nextButton.hidden = false;
	nextButtonLabelElement.textContent = currentLevelIndex === levels.length - 1 ? 'PLAY AGAIN' : 'NEXT LEVEL';
	setStatus(`Water is flowing. The community received ${levelCompletionBonus} liters!`, 'success');
	if (currentLevelIndex === levels.length - 1) {
		setStatus('All levels complete! Clean water delivered!', 'success');
		showWinConfetti();
	}
	if (recordResult.isNewRecord) {
		showNewRecordDialog(elapsedSeconds, recordResult.previousBest);
	}
}

function clearConfetti() {
	window.clearTimeout(confettiTimeout);
	if (confettiLayer) {
		confettiLayer.remove();
		confettiLayer = null;
	}
}

function showWinConfetti() {
	clearConfetti();
	confettiLayer = document.createElement('div');
	confettiLayer.className = 'confetti-layer';
	confettiLayer.setAttribute('aria-hidden', 'true');
	const confettiColors = ['#ffc907', '#2e9df7', '#4fc8fa', '#4fcb53', '#f16061'];

	for (let index = 0; index < 28; index += 1) {
		const angle = (Math.PI * 2 * index) / 28;
		const distance = 90 + (index % 4) * 24;
		const piece = document.createElement('span');
		piece.className = 'confetti-piece';
		piece.style.setProperty('--confetti-x', `${Math.cos(angle) * distance}px`);
		piece.style.setProperty('--confetti-y', `${Math.sin(angle) * distance}px`);
		piece.style.setProperty('--confetti-rotation', `${(index * 47) % 360}deg`);
		piece.style.setProperty('--confetti-delay', `${(index % 7) * 18}ms`);
		piece.style.setProperty('--confetti-color', confettiColors[index % confettiColors.length]);
		confettiLayer.append(piece);
	}

	boardStageElement.append(confettiLayer);
	confettiTimeout = window.setTimeout(clearConfetti, 2000);
}

function resetGame() {
	window.clearTimeout(scoreBonusTimeout);
	score = 300;
	scoreBonusElement.textContent = '';
	scoreBonusElement.classList.remove('is-showing');
	scoreElement.classList.remove('is-bumping');
	updateScore();
	loadLevel(0);
	startBackgroundMusic();
}

function endLevelOnTimeout() {
	levelIsOver = true;
	window.clearInterval(timerInterval);
	timeLeft = 0;
	updateTimerDisplay();
	releaseButton.disabled = true;
	setStatus('Time is up. Reset and try again.', 'error');
}

releaseButton.addEventListener('click', releaseWater);
resetButton.addEventListener('click', resetGame);
musicToggleButton.addEventListener('click', toggleBackgroundMusic);
cleanupCanButtons.forEach((button) => button.addEventListener('click', collectCan));
document.addEventListener('keydown', (event) => {
	if (event.repeat || event.target.closest('button, a, input, select, textarea, [contenteditable="true"]')) {
		return;
	}

	if (event.code === 'Space') {
		event.preventDefault();
		releaseWater();
	} else if (event.code === 'KeyN' && !nextButton.hidden) {
		event.preventDefault();
		advanceLevel();
	}
});

function advanceLevel() {
	const nextLevelIndex = (currentLevelIndex + 1) % levels.length;
	loadLevel(nextLevelIndex);
	startBackgroundMusic();
}

nextButton.addEventListener('click', advanceLevel);

updateScore();
loadLevel(currentLevelIndex);
