const PASSCODE = '0121';
const PHRASE_ONE = 'EIGHT';
const PHRASE_TWO = 'DAYS';

const screens = {
  opening: document.getElementById('opening-screen'),
  passcode: document.getElementById('passcode-screen'),
  unlock: document.getElementById('unlock-screen'),
  puzzleOne: document.getElementById('puzzle-one-screen'),
  puzzleTwo: document.getElementById('puzzle-two-screen'),
  final: document.getElementById('final-screen')
};

const state = {
  currentCode: '',
  currentScreen: 'opening',
  photo1: '',
  photo2: '',
  puzzleOneSolved: false,
  puzzleTwoSolved: false,
  boardOne: [],
  boardTwo: [],
  moveOne: 0,
  moveTwo: 0,
  previewOne: false,
  previewTwo: false,
  tileSizeOne: 3,
  tileSizeTwo: 4,
  firstPuzzleLoaded: false,
  secondPuzzleLoaded: false
};

const starContainer = document.querySelector('.stars');
const feedbackBox = document.getElementById('passcode-feedback');
const digitSlots = [...document.querySelectorAll('.digit-slot')];

function setScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('active', key === name);
  });
  state.currentScreen = name;
}

function createStars() {
  for (let i = 0; i < 120; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.opacity = (Math.random() * 0.8 + 0.2).toString();
    star.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
    starContainer.appendChild(star);
  }
}

function updateCodeDisplay() {
  digitSlots.forEach((slot, index) => {
    slot.textContent = index < state.currentCode.length ? state.currentCode[index] : '•';
  });
}

function handlePasscodeInput(value) {
  if (state.currentCode.length >= 4) {
    return;
  }
  state.currentCode += value;
  updateCodeDisplay();

  if (state.currentCode.length === 4) {
    validatePasscode();
  }
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
    const passCard = document.getElementById('passcode-screen').querySelector('.passcode-card');
    passCard.classList.remove('unlocking');
    void passCard.offsetWidth;
    passCard.classList.add('unlocking');

    feedbackBox.textContent = 'Correct!';
    feedbackBox.style.color = '#c9f7d2';

    setTimeout(() => {
      setScreen('unlock');
      state.currentCode = '';
      updateCodeDisplay();
      feedbackBox.textContent = '';
    }, 650);
  } else {
    feedbackBox.textContent = 'Not quite—try again. The code is hidden in your memories.';
    feedbackBox.style.color = '#ffd1d1';
    state.currentCode = '';
    updateCodeDisplay();
  }
}

function addKeypadListeners() {
  document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('click', () => {
      const value = key.dataset.value;
      const action = key.dataset.action;

      if (value) {
        handlePasscodeInput(value);
      } else if (action === 'backspace') {
        handleBackspace();
      } else if (action === 'clear') {
        handleClear();
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (state.currentScreen !== 'passcode') {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      handlePasscodeInput(event.key);
      return;
    }

    if (event.key === 'Backspace') {
      handleBackspace();
    }

    if (event.key === 'Escape') {
      handleClear();
    }
  });
}

function makePuzzleBoard(size) {
  const values = Array.from({ length: size * size }, (_, index) => index + 1);
  values.push(0);

  const shuffled = [...values];
  let emptyIndex = shuffled.indexOf(0);

  for (let i = 0; i < size * size * 18; i += 1) {
    const neighbours = getValidMoves(emptyIndex, size, size);
    const move = neighbours[Math.floor(Math.random() * neighbours.length)];
    [shuffled[emptyIndex], shuffled[move]] = [shuffled[move], shuffled[emptyIndex]];
    emptyIndex = move;
  }

  return shuffled;
}

function getValidMoves(index, size, boardSize) {
  const row = Math.floor(index / size);
  const col = index % size;
  const moves = [];

  if (row > 0) moves.push(index - size);
  if (row < size - 1) moves.push(index + size);
  if (col > 0) moves.push(index - 1);
  if (col < size - 1) moves.push(index + 1);

  return moves;
}

function getTilePosition(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  return { row, col };
}

function renderTileBoard(board, boardSize, imageSrc, containerId, puzzleName) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const tileSize = 100 / boardSize;

  board.forEach((value, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';

    if (value === 0) {
      tile.classList.add('empty');
      tile.setAttribute('aria-label', 'Empty tile');
      tile.disabled = true;
    } else {
      const { row, col } = getTilePosition(index, boardSize);
      const x = (col / (boardSize - 1)) * 100;
      const y = (row / (boardSize - 1)) * 100;

      tile.style.width = `${tileSize}%`;
      tile.style.height = `${tileSize}%`;
      tile.style.left = `${(index % boardSize) * tileSize}%`;
      tile.style.top = `${Math.floor(index / boardSize) * tileSize}%`;
      tile.style.backgroundImage = imageSrc ? `url("${imageSrc}")` : 'none';
      tile.style.backgroundSize = `${boardSize * 100}% ${boardSize * 100}%`;
      tile.style.backgroundPosition = `${x}% ${y}%`;
      tile.style.backgroundRepeat = 'no-repeat';
      tile.setAttribute('aria-label', `Tile ${value}`);
      tile.dataset.value = String(value);
      tile.dataset.index = String(index);
      tile.addEventListener('click', () => handleTileClick(index, board, boardSize, puzzleName));
    }

    container.appendChild(tile);
  });
}

function isSolvedBoard(board) {
  return board.every((value, index) => {
    if (index === board.length - 1) {
      return value === 0;
    }
    return value === index + 1;
  });
}

function handleTileClick(index, board, size, puzzleName) {
  const boardSource = puzzleName === 'one' ? state.boardOne : state.boardTwo;
  const emptyIndex = boardSource.indexOf(0);
  const isAdjacent = getValidMoves(emptyIndex, size, size).includes(index);

  if (!isAdjacent) {
    return;
  }

  [boardSource[emptyIndex], boardSource[index]] = [boardSource[index], boardSource[emptyIndex]];

  if (puzzleName === 'one') {
    state.moveOne += 1;
    document.getElementById('moves-one').textContent = String(state.moveOne);
    renderPuzzleOne();
    if (isSolvedBoard(state.boardOne)) {
      completePuzzleOne();
    }
  } else {
    state.moveTwo += 1;
    document.getElementById('moves-two').textContent = String(state.moveTwo);
    renderPuzzleTwo();
    if (isSolvedBoard(state.boardTwo)) {
      completePuzzleTwo();
    }
  }
}

function renderPuzzleOne() {
  const image = state.photo1 || getDefaultImage('one');
  renderTileBoard(state.boardOne, state.tileSizeOne, image, 'puzzle-one-board', 'one');
}

function renderPuzzleTwo() {
  const image = state.photo2 || getDefaultImage('two');
  renderTileBoard(state.boardTwo, state.tileSizeTwo, image, 'puzzle-two-board', 'two');
}

function getDefaultImage(type) {
  if (type === 'one') {
    return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80';
}

function startPuzzleOne() {
  state.boardOne = makePuzzleBoard(3);
  state.moveOne = 0;
  document.getElementById('moves-one').textContent = '0';
  state.puzzleOneSolved = false;
  document.getElementById('puzzle-one-reveal').classList.add('hidden');
  renderPuzzleOne();
}

function startPuzzleTwo() {
  state.boardTwo = makePuzzleBoard(4);
  state.moveTwo = 0;
  document.getElementById('moves-two').textContent = '0';
  state.puzzleTwoSolved = false;
  document.getElementById('puzzle-two-reveal').classList.add('hidden');
  renderPuzzleTwo();
}

function completePuzzleOne() {
  if (state.puzzleOneSolved) {
    return;
  }

  state.puzzleOneSolved = true;
  const reveal = document.getElementById('puzzle-one-reveal');
  reveal.classList.remove('hidden');
  reveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function completePuzzleTwo() {
  if (state.puzzleTwoSolved) {
    return;
  }

  state.puzzleTwoSolved = true;
  const reveal = document.getElementById('puzzle-two-reveal');
  reveal.classList.remove('hidden');
  reveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function previewImageForPuzzle(puzzleName, shouldShow) {
  const board = document.getElementById(puzzleName === 'one' ? 'puzzle-one-board' : 'puzzle-two-board');
  if (shouldShow) {
    board.style.backgroundImage = `url("${puzzleName === 'one' ? state.photo1 || getDefaultImage('one') : state.photo2 || getDefaultImage('two')}")`;
    board.style.backgroundSize = 'cover';
    board.style.backgroundPosition = 'center';
    board.style.filter = 'brightness(0.92) saturate(1.1)';
  } else {
    board.style.backgroundImage = 'none';
    board.style.filter = 'none';
    if (puzzleName === 'one') {
      renderPuzzleOne();
    } else {
      renderPuzzleTwo();
    }
  }
}

function bindPuzzleEvents() {
  document.getElementById('open-clue-button').addEventListener('click', () => setScreen('passcode'));
  document.getElementById('lets-find-out').addEventListener('click', () => {
    startPuzzleOne();
    setScreen('puzzleOne');
  });

  document.getElementById('restart-one').addEventListener('click', startPuzzleOne);
  document.getElementById('restart-two').addEventListener('click', startPuzzleTwo);
  document.getElementById('continue-to-puzzle-two').addEventListener('click', () => {
    startPuzzleTwo();
    setScreen('puzzleTwo');
  });
  document.getElementById('show-final-message').addEventListener('click', () => setScreen('final'));

  document.getElementById('preview-one-toggle').addEventListener('click', () => {
    state.previewOne = !state.previewOne;
    previewImageForPuzzle('one', state.previewOne);
    document.getElementById('preview-one-toggle').textContent = state.previewOne ? 'Hide Preview' : 'Preview';
  });

  document.getElementById('preview-two-toggle').addEventListener('click', () => {
    state.previewTwo = !state.previewTwo;
    previewImageForPuzzle('two', state.previewTwo);
    document.getElementById('preview-two-toggle').textContent = state.previewTwo ? 'Hide Preview' : 'Preview';
  });

  document.getElementById('hint-one').addEventListener('click', () => {
    alert('Try to bring the top-left corner into place first — the image is all about the memory you are rebuilding.');
  });

  document.getElementById('hint-two').addEventListener('click', () => {
    alert('Start with the edges, then work toward the center. You are so close.');
  });

  document.getElementById('photo-upload-1').addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      state.photo1 = loadEvent.target.result;
      renderPuzzleOne();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('photo-upload-2').addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      state.photo2 = loadEvent.target.result;
      renderPuzzleTwo();
    };
    reader.readAsDataURL(file);
  });
}

function init() {
  createStars();
  addKeypadListeners();
  bindPuzzleEvents();
  updateCodeDisplay();
  startPuzzleOne();
  startPuzzleTwo();
  setScreen('opening');
}

init();
