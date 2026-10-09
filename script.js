const PASSCODE = '0121';

const screens = {
  opening: document.getElementById('opening-screen'),
  passcode: document.getElementById('passcode-screen'),
  puzzleOne: document.getElementById('puzzle-one-screen'),
  puzzleTwo: document.getElementById('puzzle-two-screen'),
  final: document.getElementById('final-screen')
};

const state = {
  currentCode: '',
  currentScreen: 'opening',
  boardOne: [],
  boardTwo: [],
  moveOne: 0,
  moveTwo: 0,
};

const starContainer = document.querySelector('.stars');
const feedbackBox = document.getElementById('passcode-feedback');
const digitSlots = document.querySelectorAll('.digit-slot');

const PHOTO_ONE = './assets/IMG_4509.JPG';
const PHOTO_TWO = './assets/IMG_5309.JPG';

function setScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  if (screens[name]) {
    screens[name].classList.add('active');
    state.currentScreen = name;
  }
}

function updateCodeDisplay() {
  digitSlots.forEach((slot, index) => {
    slot.textContent = index < state.currentCode.length ? state.currentCode[index] : '•';
  });
}

function handlePasscodeInput(value) {
  if (state.currentCode.length >= 4) return;
  state.currentCode += value;
  updateCodeDisplay();
  if (state.currentCode.length === 4) validatePasscode();
}

function handleBackspace() {
  state.currentCode = state.currentCode.slice(0, -1);
  updateCodeDisplay();
  feedbackBox.textContent = '';
}

function handleClear() {
  state.currentCode = '';
  updateCodeDisplay();
  feedbackBox.textContent = '';
}

function validatePasscode() {
  if (state.currentCode === PASSCODE) {
    feedbackBox.textContent = 'Correct!';
    feedbackBox.style.color = '#c9f7d2';

    setTimeout(() => {
      state.currentCode = '';
      updateCodeDisplay();
      feedbackBox.textContent = '';
      initPuzzleOne();
      setScreen('puzzleOne');
    }, 500);
  } else {
    feedbackBox.textContent = 'Not quite—try again. The code is from Part One.';
    feedbackBox.style.color = '#ffd1d1';
    state.currentCode = '';
    updateCodeDisplay();
  }
}

function addKeypadListeners() {
  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
      const value = key.dataset.value;
      const action = key.dataset.action;
      if (value) handlePasscodeInput(value);
      else if (action === 'backspace') handleBackspace();
      else if (action === 'clear') handleClear();
    });
  });

  document.addEventListener('keydown', e => {
    if (state.currentScreen !== 'passcode') return;
    if (/^[0-9]$/.test(e.key)) handlePasscodeInput(e.key);
    if (e.key === 'Backspace') handleBackspace();
    if (e.key === 'Escape') handleClear();
  });
}

function getValidMoves(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  const moves = [];
  if (row > 0) moves.push(index - size);
  if (row < size - 1) moves.push(index + size);
  if (col > 0) moves.push(index - 1);
  if (col < size - 1) moves.push(index + 1);
  return moves;
}

function makeShuffledBoard(size) {
  const values = Array.from({ length: size * size }, (_, i) => i + 1);
  values.push(0);
  const board = [...values];
  let emptyIndex = board.indexOf(0);

  for (let i = 0; i < size * size * 18; i += 1) {
    const neighbors = getValidMoves(emptyIndex, size);
    const move = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[emptyIndex], board[move]] = [board[move], board[emptyIndex]];
    emptyIndex = move;
  }

  return board;
}

function isSolved(board) {
  for (let i = 0; i < board.length - 1; i += 1) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

function renderBoard(board, size, imageSrc, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const tileSize = 100 / size;

  board.forEach((value, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.style.width = `${tileSize}%`;
    tile.style.height = `${tileSize}%`;
    tile.style.left = `${(index % size) * tileSize}%`;
    tile.style.top = `${Math.floor(index / size) * tileSize}%`;

    if (value === 0) {
      tile.classList.add('empty');
      tile.disabled = true;
    } else {
      const row = Math.floor((value - 1) / size);
      const col = (value - 1) % size;
      tile.style.backgroundImage = `url("${imageSrc}")`;
      tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
      tile.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
      tile.addEventListener('click', () => handleBoardMove(index, containerId));
    }

    container.appendChild(tile);
  });
}

function handleBoardMove(index, containerId) {
  const board = containerId === 'puzzle-one-board' ? state.boardOne : state.boardTwo;
  const size = containerId === 'puzzle-one-board' ? 3 : 4;
  const emptyIndex = board.indexOf(0);
  const validMoves = getValidMoves(emptyIndex, size);

  if (!validMoves.includes(index)) return;

  [board[emptyIndex], board[index]] = [board[index], board[emptyIndex]];

  if (containerId === 'puzzle-one-board') {
    state.moveOne += 1;
    document.getElementById('moves-one').textContent = String(state.moveOne);
    renderBoard(board, 3, PHOTO_ONE, 'puzzle-one-board');

    if (isSolved(board)) {
      console.log('Puzzle One Solved!');
      setTimeout(() => {
        initPuzzleTwo();
        setScreen('puzzleTwo');
      }, 550);
    }
  } else {
    state.moveTwo += 1;
    document.getElementById('moves-two').textContent = String(state.moveTwo);
    renderBoard(board, 4, PHOTO_TWO, 'puzzle-two-board');

    if (isSolved(board)) {
      console.log('Puzzle Two Solved!');
      setTimeout(() => {
        setScreen('final');
      }, 550);
    }
  }
}

function initPuzzleOne() {
  state.boardOne = makeShuffledBoard(3);
  state.moveOne = 0;
  document.getElementById('moves-one').textContent = '0';
  renderBoard(state.boardOne, 3, PHOTO_ONE, 'puzzle-one-board');
}

function initPuzzleTwo() {
  state.boardTwo = makeShuffledBoard(4);
  state.moveTwo = 0;
  document.getElementById('moves-two').textContent = '0';
  renderBoard(state.boardTwo, 4, PHOTO_TWO, 'puzzle-two-board');
}

function bindEvents() {
  document.getElementById('open-clue-button').addEventListener('click', () => setScreen('passcode'));
  document.getElementById('restart-one').addEventListener('click', initPuzzleOne);
  document.getElementById('restart-two').addEventListener('click', initPuzzleTwo);
}

function init() {
  addKeypadListeners();
  bindEvents();
  updateCodeDisplay();
  setScreen('opening');
}

init();
