const boardElement = document.getElementById('game-board');
const boardStageElement = document.getElementById('board-stage');
const sourceMarkerElement = document.getElementById('source-marker');
const destinationMarkerElement = document.getElementById('destination-marker');
const levelNumberElement = document.getElementById('level-number');
const fieldLabelElement = document.getElementById('field-label');
const bestTimeElement = document.getElementById('best-time');
const pollutionHintElement = document.getElementById('pollution-hint');
const goalValueElement = document.getElementById('goal-value');
const difficultyButtons = Array.from(document.querySelectorAll('.difficulty-button'));
const scoreElement = document.getElementById('score-value');
const scoreBonusElement = document.getElementById('score-bonus');
const cleanupCanCountElement = document.getElementById('cleanup-can-count');
const cleanupCansElement = document.getElementById('cleanup-cans');
const powerupKitsElement = document.getElementById('powerup-kits');
const powerupCountElement = document.getElementById('powerup-count');
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
const gameOverDialog = document.getElementById('game-over-dialog');
const gameOverLevelElement = document.getElementById('game-over-level');
const restartLevelButton = document.getElementById('restart-level-button');
const restartGameButton = document.getElementById('restart-game-button');
const toastElement = document.getElementById('toast');
const flowWarningElement = document.getElementById('flow-warning');
const flowWarningTextElement = document.getElementById('flow-warning-text');

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
const cleanupCanBonus = 50;
const totalCans = 3;
const obstacleMoveAfterInteractionSeconds = 2;
const levelCompletionBonus = 300;
// Milestone messages, shown when the score reaches a percent of the level's goal.
const scoreMilestones = [
	{ percent: 25, message: 'Nice start! A quarter of the way there!' },
	{ percent: 50, message: 'Halfway there! Keep it flowing!' },
	{ percent: 75, message: 'Almost there! The village is counting on you!' },
	{ percent: 100, message: 'Goal reached! Connect the pipes and release the water!' }
];
const bestTimesStorageKey = 'waterWorksBestTimes';

// Each mode changes the time, the pollution pace, the pollution damage and the score goal per level.
const difficultySettings = {
	easy: {
		timeScale: 1.3, // multiplies each level's time
		moveEvery: 7, // seconds between pollution moves
		kits: 2, // repair kits per level
		penalty: 50, // liters lost when water hits pollution
		lockSeconds: 2, // seconds a damaged pipe is locked
		damageCost: 0, // liters lost when pollution damages your pipe
		contaminationCost: 10, // liters lost per polluted pipe in the final route
		goals: [100, 300, 500] // liters needed to release water on levels 1-3
	},
	normal: {
		timeScale: 1,
		moveEvery: 5,
		kits: 1,
		penalty: 100,
		lockSeconds: 3,
		damageCost: 10,
		contaminationCost: 20,
		goals: [250, 550, 800]
	},
	hard: {
		timeScale: 0.8,
		moveEvery: 4,
		kits: 1,
		penalty: 150,
		lockSeconds: 5,
		damageCost: 25,
		contaminationCost: 40,
		goals: [300, 650, 1000]
	}
};
const difficultyStorageKey = 'waterWorksDifficulty';

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

let difficultyName = readSavedDifficulty();
let difficulty = difficultySettings[difficultyName];
let currentLevelIndex = 0;
let activePipes = [];
let activeObstacles = [];
let flowingPipes = [];
let timeLeft = 0;
let obstacleMoveCountdown = difficulty.moveEvery;
let lastInteractedPipe = null;
let score = 300;
let levelStartScore = 300; // score when the current level began, used by the reset button
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
let cursor = { row: 2, col: 0 }; // the pipe selected with the keyboard
let shownMilestones = []; // percents already announced this level
let toastTimeout = null;
let attackHappened = false; // becomes true after pollution attacks, which turns the warning on

function readSavedDifficulty() {
	try {
		const savedName = window.localStorage.getItem(difficultyStorageKey);
		return difficultySettings[savedName] ? savedName : 'normal';
	} catch {
		return 'normal';
	}
}

// Level time after the difficulty scale is applied.
function getLevelTime() {
	return Math.round(levels[currentLevelIndex].time * difficulty.timeScale);
}

function getLevelGoal() {
	return difficulty.goals[currentLevelIndex];
}

// Best times are saved per difficulty so modes don't overwrite each other.
function getBestTimeKey() {
	return `${difficultyName}-${currentLevelIndex}`;
}

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
	const bestTime = bestTimes[getBestTimeKey()];
	bestTimeElement.textContent = Number.isInteger(bestTime) ? formatTime(bestTime) : '--:--';
}

function saveBestTime(elapsedSeconds) {
	const currentBest = bestTimes[getBestTimeKey()];
	if (Number.isInteger(currentBest) && currentBest <= elapsedSeconds) {
		return { isNewRecord: false, previousBest: currentBest };
	}

	bestTimes[getBestTimeKey()] = elapsedSeconds;
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
	if (pipe.lockedSeconds > 0) {
		// Damaged pipes show a countdown and can't be turned.
		button.classList.add('is-damaged');
		button.dataset.lock = `${pipe.lockedSeconds}s`;
	}
	if (pipe.polluted) {
		button.classList.add('is-polluted');
	}
	if (levels[currentLevelIndex].obstaclePath && lastInteractedPipe && !levelIsOver
		&& lastInteractedPipe.row === pipe.row && lastInteractedPipe.col === pipe.col) {
		button.classList.add('is-pollution-target');
	}

	if (cursor.row === pipe.row && cursor.col === pipe.col) {
		button.classList.add('is-cursor');
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

		if (pipe.lockedSeconds > 0) {
			setStatus(`This pipe is damaged! Wait ${pipe.lockedSeconds}s to turn it.`, 'error');
			playMissSound();
			return;
		}

		startBackgroundMusic();
		playClickSound();
		// Turning a pipe washes the pollution off it.
		pipe.polluted = false;
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
				obstacleCell.setAttribute('aria-label', `Polluted water. Hitting it costs ${difficulty.penalty} liters.`);
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
	const percentageLeft = (timeLeft / getLevelTime()) * 100;

	timerValueElement.textContent = timeLeft;
	timerBarElement.style.width = `${percentageLeft}%`;
	timerBarElement.style.backgroundColor = timeLeft <= 15 ? 'var(--red)' : 'var(--yellow)';
	timerElement.classList.toggle('is-low', timeLeft <= 15);
}

function updateScore() {
	scoreElement.textContent = String(score).padStart(4, '0');
	checkScoreMilestones();
}

// Pops up a short message over the game for a few seconds.
function showToast(message, type) {
	toastElement.textContent = message;
	toastElement.className = `toast is-${type}`;
	toastElement.hidden = false;
	window.clearTimeout(toastTimeout);
	toastTimeout = window.setTimeout(() => {
		toastElement.hidden = true;
	}, 2800);
}

// Shows each milestone message once, the first time the score reaches it.
function checkScoreMilestones() {
	if (levelIsOver) {
		return;
	}

	const percentOfGoal = (score / getLevelGoal()) * 100;
	scoreMilestones.forEach((milestone) => {
		if (percentOfGoal >= milestone.percent && !shownMilestones.includes(milestone.percent)) {
			shownMilestones.push(milestone.percent);
			showToast(milestone.message, 'good');
			playMilestoneSound();
		}
	});
}

// Time warnings: once at the halfway point and once at 10 seconds left.
function checkTimeWarnings() {
	if (levelIsOver) {
		return;
	}

	if (timeLeft === Math.floor(getLevelTime() / 2)) {
		showToast('Half your time is gone!', 'warn');
		playWarningSound();
	} else if (timeLeft === 10) {
		showToast('Only 10 seconds left! Hurry!', 'danger');
		playWarningSound();
	}
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

function buildCleanupCans() {
	cleanupCansElement.replaceChildren();
	for (let canIndex = 0; canIndex < totalCans; canIndex += 1) {
		const can = document.createElement('button');
		can.className = 'cleanup-can';
		can.type = 'button';
		can.dataset.canIndex = canIndex;
		can.setAttribute('aria-label', `Collect can for ${cleanupCanBonus} water points`);
		can.innerHTML = `<span class="can-icon" aria-hidden="true"><span></span></span><span>+${cleanupCanBonus} L</span>`;
		cleanupCansElement.append(can);
	}
}

// Each kit is a button that is removed from the page once it is used.
function buildRepairKits() {
	powerupKitsElement.replaceChildren();
	for (let kitIndex = 0; kitIndex < difficulty.kits; kitIndex += 1) {
		const kit = document.createElement('button');
		kit.className = 'cleanup-can repair-kit';
		kit.type = 'button';
		kit.setAttribute('aria-label', 'Use repair kit to clean and fix all pipes');
		kit.setAttribute('aria-keyshortcuts', 'R');
		kit.innerHTML = '<span class="kit-icon" aria-hidden="true">+</span><span>FIX ALL</span>';
		powerupKitsElement.append(kit);
	}
	updatePowerupCount();
}

function updatePowerupCount() {
	const kitsLeft = powerupKitsElement.querySelectorAll('.repair-kit:not(.is-collected)').length;
	powerupCountElement.textContent = kitsLeft === 0 ? 'USED UP' : `${kitsLeft} READY`;
}

// Shows what the player still needs to do before water can flow. Hides itself once everything is done.
function updateFlowWarning(playSound) {
	const brokenCount = activePipes.filter((pipe) => pipe.polluted || pipe.lockedSeconds > 0).length;
	const litersNeeded = Math.max(0, getLevelGoal() - score);
	const hasKit = powerupKitsElement.querySelector('.repair-kit:not(.is-collected)') !== null;
	const needs = [];

	if (litersNeeded > 0) {
		needs.push(`pick up cans (you need ${litersNeeded} more liters)`);
	}
	if (brokenCount > 0 && hasKit) {
		needs.push(`use FIX ALL (press R) to clean ${brokenCount} damaged pipe(s)`);
	}

	if (!attackHappened || needs.length === 0) {
		flowWarningElement.hidden = true;
		return;
	}

	flowWarningTextElement.textContent = `Before water can flow: ${needs.join(' and ')}.`;
	// Restart the flashing animation each time the warning appears.
	flowWarningElement.hidden = false;
	flowWarningElement.style.animation = 'none';
	void flowWarningElement.offsetWidth;
	flowWarningElement.style.animation = '';
	if (playSound) {
		playWarningSound();
	}
}

function useRepairKit() {
	const kit = powerupKitsElement.querySelector('.repair-kit:not(.is-collected)');
	if (!kit || levelIsOver) {
		return;
	}

	const brokenPipes = activePipes.filter((pipe) => pipe.polluted || pipe.lockedSeconds > 0);
	if (brokenPipes.length === 0) {
		setStatus('All pipes are already clean and working. Save your kit!');
		return;
	}

	// Clean every polluted pipe and unlock every damaged pipe.
	brokenPipes.forEach((pipe) => {
		pipe.polluted = false;
		pipe.lockedSeconds = 0;
	});
	kit.classList.add('is-collected');
	window.setTimeout(() => kit.remove(), 250);
	updatePowerupCount();
	renderBoard();
	playRepairSound();
	setStatus(`Repair kit used! ${brokenPipes.length} pipe(s) cleaned and fixed.`, 'success');
	updateFlowWarning(false);
}

function collectCan(event) {
	const canButton = event.target.closest('.cleanup-can');
	if (!canButton || levelIsOver) {
		return;
	}

	const canIndex = Number(canButton.dataset.canIndex);
	if (collectedCans.includes(canIndex)) {
		return;
	}

	collectedCans.push(canIndex);
	// The can shrinks away, then is removed from the page.
	canButton.classList.add('is-collected');
	window.setTimeout(() => canButton.remove(), 250);
	const cansLeft = totalCans - collectedCans.length;
	cleanupCanCountElement.textContent = cansLeft === 0 ? 'ALL CLEAR' : `${cansLeft} LEFT`;
	score += cleanupCanBonus;
	updateScore();
	showScoreBonus(cleanupCanBonus);
	playCollectSound();
	setStatus(`Can collected! +${cleanupCanBonus} liters for clean water.`, 'success');
	updateFlowWarning(false);
}

function setStatus(message, state) {
	statusMessageElement.textContent = message;
	statusElement.classList.remove('is-success', 'is-error');

	if (state) {
		statusElement.classList.add(`is-${state}`);
	}
}

// Picks the empty tile that is farthest from a pipe, so pollution starts on the opposite side from the player.
function getFarthestFreeTile(fromTile) {
	let farthestTile = { row: 0, col: boardSize - 1 };
	let farthestDistance = -1;
	for (let row = 0; row < boardSize; row += 1) {
		for (let col = 0; col < boardSize; col += 1) {
			const isRoutePipe = levels[currentLevelIndex].pipes.some((pipe) => pipe.row === row && pipe.col === col);
			const distance = Math.abs(row - fromTile.row) + Math.abs(col - fromTile.col);
			if (!isRoutePipe && distance > farthestDistance) {
				farthestTile = { row, col };
				farthestDistance = distance;
			}
		}
	}
	return farthestTile;
}

// Pollution creeps one square at a time toward the pipe you last turned. It waits until you turn a pipe.
function movePollution() {
	if (!levels[currentLevelIndex].obstaclePath || levelIsOver || !lastInteractedPipe) {
		return;
	}

	const currentObstacle = activeObstacles[0];
	const rowGap = lastInteractedPipe.row - currentObstacle.row;
	const colGap = lastInteractedPipe.col - currentObstacle.col;

	// Step along whichever direction has the biggest gap left.
	const nextObstacle = { row: currentObstacle.row, col: currentObstacle.col };
	if (Math.abs(colGap) >= Math.abs(rowGap)) {
		nextObstacle.col += Math.sign(colGap);
	} else {
		nextObstacle.row += Math.sign(rowGap);
	}

	// The tile pollution leaves behind taints its pipe.
	const leftPipe = getPipeAt(currentObstacle.row, currentObstacle.col);
	if (leftPipe) {
		leftPipe.polluted = true;
	}

	// Pollution that reaches the pipe you turned damages it, then a new blob starts far away.
	if (nextObstacle.row === lastInteractedPipe.row && nextObstacle.col === lastInteractedPipe.col) {
		const targetPipe = getPipeAt(nextObstacle.row, nextObstacle.col);
		const damagedTile = { ...lastInteractedPipe };
		let message = 'Pollution reached your pipe!';
		if (targetPipe) {
			targetPipe.polluted = true;
			if (!(targetPipe.lockedSeconds > 0)) {
				targetPipe.lockedSeconds = difficulty.lockSeconds;
				const litersLost = Math.min(score, difficulty.damageCost);
				score -= litersLost;
				updateScore();
				message = `Pollution damaged your pipe! It is locked for ${difficulty.lockSeconds}s${litersLost > 0 ? ` and cost ${litersLost} liters` : ''}.`;
			}
		}
		activeObstacles = [{ ...getFarthestFreeTile(damagedTile), isMoving: true }];
		lastInteractedPipe = null;
		renderBoard();
		setStatus(message, 'error');
		attackHappened = true;
		updateFlowWarning(true);
		return;
	}

	activeObstacles = [{ ...nextObstacle, isMoving: true }];
	renderBoard();
	setStatus('Pollution is creeping toward the pipe you turned. Watch the hazard.');
	if (leftPipe) {
		attackHappened = true;
		updateFlowWarning(true);
	}
}

function loadLevel(levelIndex) {
	window.clearInterval(timerInterval);
	window.clearTimeout(flowSoundTimeout);
	clearConfetti();
	currentLevelIndex = levelIndex;
	levelIsOver = false;
	timeLeft = getLevelTime();
	activePipes = levels[currentLevelIndex].pipes.map((pipe) => ({ ...pipe }));
	const currentLevel = levels[currentLevelIndex];
	// Pollution starts on the side of the board opposite the water source.
	activeObstacles = currentLevel.obstaclePath ? [getFarthestFreeTile({ row: source.row, col: 0 })] : [];
	obstacleMoveCountdown = difficulty.moveEvery;
	levelStartScore = score;
	cursor = { row: 2, col: 0 };
	toastElement.hidden = true;
	// Milestones already passed when the level starts are skipped so they don't pop up right away.
	shownMilestones = scoreMilestones
		.filter((milestone) => (score / getLevelGoal()) * 100 >= milestone.percent)
		.map((milestone) => milestone.percent);
	lastInteractedPipe = null;
	attackHappened = false;
	flowWarningElement.hidden = true;
	collectedCans = [];
	buildCleanupCans();
	buildRepairKits();
	cleanupCanCountElement.textContent = `${totalCans} LEFT`;
	flowingPipes = [];
	sourceMarkerElement.style.gridRow = String(source.row + 1);
	destinationMarkerElement.style.gridRow = String(getDestination().row + 1);

	for (let row = 0; row < boardSize; row += 1) {
		for (let col = 0; col < boardSize; col += 1) {
			if (!getPipeAt(row, col)) {
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
	goalValueElement.textContent = getLevelGoal();
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
		checkTimeWarnings();

		// Count down the lock on damaged pipes.
		const lockedPipes = activePipes.filter((pipe) => pipe.lockedSeconds > 0);
		lockedPipes.forEach((pipe) => {
			pipe.lockedSeconds -= 1;
		});
		if (lockedPipes.length > 0) {
			renderBoard();
		}

		if (currentLevel.obstaclePath && !levelIsOver) {
			obstacleMoveCountdown -= 1;
			if (obstacleMoveCountdown <= 0) {
				movePollution();
				obstacleMoveCountdown = difficulty.moveEvery;
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

// Chill but upbeat chiptune loop. Chords per bar: G - D - Em - C, 8 steps per bar.
// Each number is a MIDI note (higher number = higher pitch). null = a rest.
// The catchy hook repeats, then the last bar changes so the loop feels like a song.
const musicBarMelodies = [
	[79, 83, 86, null, 83, 79, 83, null], // bar 1 (G): the hook
	[81, 86, 90, null, 86, 81, 86, null], // bar 2 (D)
	[83, 88, 91, null, 88, 83, 88, 86],   // bar 3 (Em)
	[84, 88, 86, 84, 83, 79, 81, 83],     // bar 4 (C)
	[81, 83, 86, 90, 88, 86, 83, 81]      // ending bar (D)
];
const musicBarChords = [[67, 71, 74], [62, 66, 69], [64, 67, 71], [60, 64, 67]];
const musicBarBassRoots = [43, 38, 40, 36];
// The song plays these bars in order, then loops. Bar 4 in this list is the D-chord ending.
const musicSong = [0, 1, 2, 3, 0, 1, 2, 4];
const musicStepSeconds = 0.22; // slower, relaxed tempo
const musicScheduleAhead = 0.4; // seconds of music queued in advance so it never stutters
let noiseBuffer = null;
let nextMusicTime = 0;

function midiToFrequency(midiNote) {
	return 440 * 2 ** ((midiNote - 69) / 12);
}

// Short burst of noise used for the drum hits.
function playNoiseHit(context, duration, volume, filterFrequency, startTime = context.currentTime) {
	if (!noiseBuffer) {
		noiseBuffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
		const samples = noiseBuffer.getChannelData(0);
		for (let index = 0; index < samples.length; index += 1) {
			samples[index] = Math.random() * 2 - 1;
		}
	}

	const hit = context.createBufferSource();
	const hitFilter = context.createBiquadFilter();
	const hitVolume = context.createGain();
	hit.buffer = noiseBuffer;
	hitFilter.type = 'highpass';
	hitFilter.frequency.value = filterFrequency;
	hitVolume.gain.setValueAtTime(volume, startTime);
	hitVolume.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
	hit.connect(hitFilter);
	hitFilter.connect(hitVolume);
	hitVolume.connect(context.destination);
	hit.start(startTime);
	hit.stop(startTime + duration);
}

function playKick(context, startTime = context.currentTime) {
	const kick = context.createOscillator();
	const kickVolume = context.createGain();
	const now = startTime;
	kick.frequency.setValueAtTime(150, now);
	kick.frequency.exponentialRampToValueAtTime(45, now + 0.1);
	kickVolume.gain.setValueAtTime(0.03, now);
	kickVolume.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
	kick.connect(kickVolume);
	kickVolume.connect(context.destination);
	kick.start(now);
	kick.stop(now + 0.14);
}

// Plays one step of the song at an exact audio time (startTime), so timing is steady.
function scheduleMusicStep(context, startTime) {
	const delay = startTime - context.currentTime;
	const barNumber = Math.floor(musicNoteIndex / 8);
	const step = musicNoteIndex % 8;
	const melodyNumber = musicSong[barNumber];
	const chordNumber = melodyNumber === 4 ? 1 : melodyNumber;
	const chord = musicBarChords[chordNumber];
	const bassRoot = musicBarBassRoots[chordNumber];
	const leadNote = musicBarMelodies[melodyNumber][step];

	// Lead melody (square wave). A rest (null) plays nothing.
	if (leadNote !== null) {
		playTone(context, midiToFrequency(leadNote), delay, 0.2, 0.01, 'square');
	}
	// Soft arpeggio that shadows the chord.
	playTone(context, midiToFrequency(chord[[0, 1, 2, 1, 0, 1, 2, 1][step]] - 12), delay, 0.12, 0.004, 'square');
	// Bouncy bass (triangle wave) that jumps up an octave on the off-beats.
	const bassSteps = [0, null, 12, null, 0, null, 7, null];
	if (bassSteps[step] !== null) {
		playTone(context, midiToFrequency(bassRoot + bassSteps[step]), delay, 0.2, 0.014, 'triangle');
	}
	// Gentle drums: kick on steps 0 and 4, soft snare on step 6, hi-hat on odd steps.
	if (step === 0 || step === 4) {
		playKick(context, startTime);
	} else if (step === 6) {
		playNoiseHit(context, 0.08, 0.012, 2500, startTime);
	} else if (step % 2 === 1) {
		playNoiseHit(context, 0.04, 0.007, 6000, startTime);
	}

	musicNoteIndex = (musicNoteIndex + 1) % (musicSong.length * 8);
}

// Runs often and queues any steps that fall in the next fraction of a second.
function playMusicNote() {
	if (!musicEnabled) {
		return;
	}

	const context = getAudioContext();
	if (!context) {
		return;
	}

	// If the browser slowed this page down, restart from "now" instead of rushing to catch up.
	if (nextMusicTime < context.currentTime) {
		nextMusicTime = context.currentTime + 0.05;
	}
	while (nextMusicTime < context.currentTime + musicScheduleAhead) {
		scheduleMusicStep(context, nextMusicTime);
		nextMusicTime += musicStepSeconds;
	}
}

// Short "blip" for clicking a button or turning a pipe.
function playClickSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	playTone(context, 880, 0, 0.06, 0.02, 'square');
}

// Bright coin-like "ding" for collecting a can.
function playCollectSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	playTone(context, 987.77, 0, 0.1, 0.025, 'square');
	playTone(context, 1318.51, 0.08, 0.25, 0.025, 'square');
}

// Low, falling "buzz" for a miss: pollution hits, a failed route, or a locked pipe.
function playMissSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	playTone(context, 220, 0, 0.15, 0.03, 'sawtooth');
	playTone(context, 165, 0.13, 0.25, 0.03, 'sawtooth');
}

// Happy rising "level up" notes for a score milestone.
function playMilestoneSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	[659.25, 783.99, 1046.5].forEach((frequency, index) => {
		playTone(context, frequency, index * 0.09, 0.15, 0.022, 'triangle');
	});
}

// Two-tone alarm for the warning banner.
function playWarningSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	[440, 330, 440, 330].forEach((frequency, index) => {
		playTone(context, frequency, index * 0.16, 0.14, 0.03, 'square');
	});
}

// Rising sparkle for the repair kit.
function playRepairSound() {
	const context = getAudioContext();
	if (!context) {
		return;
	}

	[523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((frequency, index) => {
		playTone(context, frequency, index * 0.07, 0.15, 0.02, 'square');
	});
}

function startBackgroundMusic() {
	if (!musicEnabled || musicInterval !== null || !getAudioContext()) {
		return;
	}

	musicNoteIndex = 0;
	nextMusicTime = 0;
	playMusicNote();
	musicInterval = window.setInterval(playMusicNote, 100);
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
		const litersLost = Math.min(score, difficulty.penalty);
		score -= litersLost;
		updateScore();
		boardElement.classList.add('is-failed');
		setStatus(`Pollution! You lost ${litersLost} liters. Find a cleaner route.`, 'error');
		playMissSound();
		window.setTimeout(() => boardElement.classList.remove('is-failed'), 700);
		return;
	}

	if (!route.isComplete) {
		boardElement.classList.add('is-failed');
		setStatus('Not quite. The water needs one clear route.', 'error');
		playMissSound();
		window.setTimeout(() => boardElement.classList.remove('is-failed'), 700);
		return;
	}

	// The route works, but the score goal must be met too.
	if (score < getLevelGoal()) {
		setStatus(`Route is clear, but you need ${getLevelGoal() - score} more liters. Pick up cans!`, 'error');
		attackHappened = true;
		playMissSound();
		updateFlowWarning(true);
		return;
	}

	levelIsOver = true;
	window.clearInterval(timerInterval);
	const elapsedSeconds = getLevelTime() - timeLeft;
	const recordResult = saveBestTime(elapsedSeconds);
	updateBestTimeDisplay();
	stopBackgroundMusic();
	playVictorySound();
	flowSoundTimeout = window.setTimeout(playWaterSound, 600);
	// Water that flows through polluted pipes arrives dirty, so the bonus shrinks.
	const pollutedCount = route.pipes.filter((routePipe) => getPipeAt(routePipe.row, routePipe.col).polluted).length;
	const contaminationLoss = Math.min(levelCompletionBonus, pollutedCount * difficulty.contaminationCost);
	const deliveredLiters = levelCompletionBonus - contaminationLoss;
	score += deliveredLiters;
	updateScore();
	showScoreBonus(deliveredLiters);
	flowingPipes = route.pipes;
	boardElement.classList.add('is-flowing');
	boardElement.classList.add('is-celebrating');
	boardStageElement.classList.add('is-flowing');
	renderBoard();
	releaseButton.hidden = true;
	nextButton.hidden = false;
	nextButtonLabelElement.textContent = currentLevelIndex === levels.length - 1 ? 'PLAY AGAIN' : 'NEXT LEVEL';
	setStatus(contaminationLoss > 0
		? `Water is flowing, but ${pollutedCount} polluted pipe(s) dirtied it. The community received ${deliveredLiters} liters.`
		: `Water is flowing. The community received ${deliveredLiters} liters!`, 'success');
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

// Restarts only the level you are on: pipes, cans, kits and timer reset, and the score goes back to what it was when the level began.
function resetGame() {
	window.clearTimeout(scoreBonusTimeout);
	score = levelStartScore;
	scoreBonusElement.textContent = '';
	scoreBonusElement.classList.remove('is-showing');
	scoreElement.classList.remove('is-bumping');
	updateScore();
	loadLevel(currentLevelIndex);
	startBackgroundMusic();
}

function endLevelOnTimeout() {
	levelIsOver = true;
	window.clearInterval(timerInterval);
	timeLeft = 0;
	updateTimerDisplay();
	releaseButton.disabled = true;
	setStatus('Time is up. Reset and try again.', 'error');
	// Pop up the game over window so the player can pick what to do next.
	gameOverLevelElement.textContent = `LEVEL ${String(currentLevelIndex + 1).padStart(2, '0')}`;
	if (!gameOverDialog.open) {
		gameOverDialog.showModal();
	}
}

// Starts over from level 1 with the starting score.
function restartGame() {
	window.clearTimeout(scoreBonusTimeout);
	score = 300;
	scoreBonusElement.textContent = '';
	scoreBonusElement.classList.remove('is-showing');
	scoreElement.classList.remove('is-bumping');
	updateScore();
	loadLevel(0);
	startBackgroundMusic();
}

restartLevelButton.addEventListener('click', () => {
	gameOverDialog.close();
	resetGame();
});
restartGameButton.addEventListener('click', () => {
	gameOverDialog.close();
	restartGame();
});

function updateDifficultyButtons() {
	difficultyButtons.forEach((button) => {
		button.setAttribute('aria-pressed', String(button.dataset.difficulty === difficultyName));
	});
}

function setDifficulty(event) {
	const newName = event.currentTarget.dataset.difficulty;
	if (newName === difficultyName) {
		return;
	}

	difficultyName = newName;
	difficulty = difficultySettings[newName];
	try {
		window.localStorage.setItem(difficultyStorageKey, newName);
	} catch {
		// The mode still works for this session without browser storage.
	}
	updateDifficultyButtons();
	// A new mode changes the rules, so restart from level 1.
	resetGame();
	setStatus(`${newName.toUpperCase()} mode: new time, pollution and score goals.`);
}

releaseButton.addEventListener('click', releaseWater);
difficultyButtons.forEach((button) => button.addEventListener('click', setDifficulty));
resetButton.addEventListener('click', resetGame);
musicToggleButton.addEventListener('click', toggleBackgroundMusic);
cleanupCansElement.addEventListener('click', collectCan);
powerupKitsElement.addEventListener('click', (event) => {
	if (event.target.closest('.repair-kit')) {
		useRepairKit();
	}
});
// Arrow keys or WASD move the highlighted pipe; Enter or E turns it.
const moveKeys = {
	ArrowUp: { row: -1, col: 0 }, KeyW: { row: -1, col: 0 },
	ArrowDown: { row: 1, col: 0 }, KeyS: { row: 1, col: 0 },
	ArrowLeft: { row: 0, col: -1 }, KeyA: { row: 0, col: -1 },
	ArrowRight: { row: 0, col: 1 }, KeyD: { row: 0, col: 1 }
};

function moveCursor(move) {
	// Stay inside the board.
	cursor = {
		row: Math.min(boardSize - 1, Math.max(0, cursor.row + move.row)),
		col: Math.min(boardSize - 1, Math.max(0, cursor.col + move.col))
	};
	renderBoard();
}

function turnCursorPipe() {
	const pipeButton = boardElement.querySelector('.is-cursor');
	if (pipeButton) {
		pipeButton.click();
	}
}

document.addEventListener('keydown', (event) => {
	const isPipeFocused = event.target.closest('.pipe-piece') !== null;
	if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
		return;
	}
	if (!isPipeFocused && event.target.closest('button, a, input, select, textarea, [contenteditable="true"]')) {
		return;
	}

	if (moveKeys[event.code]) {
		// Arrow keys only move the highlight once a pipe is focused, so they can still scroll the page.
		const isArrowKey = event.code.startsWith('Arrow');
		if (isArrowKey && !isPipeFocused) {
			return;
		}
		event.preventDefault();
		if (!levelIsOver) {
			moveCursor(moveKeys[event.code]);
		}
		return;
	}
	if (event.code === 'Enter' || event.code === 'KeyE') {
		event.preventDefault();
		turnCursorPipe();
		return;
	}

	if (event.repeat || event.target.closest('button, a, input, select, textarea, [contenteditable="true"]')) {
		return;
	}

	if (event.code === 'Space') {
		event.preventDefault();
		// Space goes to the next level once the water is flowing, otherwise it releases the water.
		if (!nextButton.hidden) {
			advanceLevel();
		} else {
			releaseWater();
		}
	} else if (event.code === 'KeyR') {
		useRepairKit();
	} else if (event.code === 'KeyN') {
		resetGame();
	} else if (event.code === 'KeyM') {
		toggleBackgroundMusic();
	}
});

// Every menu button (difficulty, reset, music, next level) makes a click sound.
document.addEventListener('click', (event) => {
	if (event.target.closest('.difficulty-button, .button-reset, .button-next, .audio-toggle')) {
		playClickSound();
	}
});

function advanceLevel() {
	const nextLevelIndex = (currentLevelIndex + 1) % levels.length;
	loadLevel(nextLevelIndex);
	startBackgroundMusic();
}

nextButton.addEventListener('click', advanceLevel);

updateDifficultyButtons();
loadLevel(currentLevelIndex);
updateScore();

// Bring the board into view while the sticky toolbar keeps the game controls accessible.
boardStageElement.scrollIntoView({ block: 'center' });
