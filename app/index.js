import document from "document";
import { display } from "display";
import clock from "clock";

// --- AYARLAR ---
const GRAVITY = 0.7;
const LIFT = -9;
const GAP_SIZE = 110; 
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300;
const INITIAL_SPEED = 3.5; // Başlangıç hızı

// Değişken hız
let currentPipeSpeed = INITIAL_SPEED;

// --- GÖRSEL BOYUTLARI ---
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X_POS = 63;
const PIPE_TOTAL_WIDTH = 52; 
const PIPE_CAP_HEIGHT = 26; 

// --- Değişkenler ---
let birdY = 168;
let velocity = 0;
let score = 0;
let isGameOver = false;
let isPlaying = false;
let animationFrameRequest;
let isHardMode = false; // Zorluk kontrolü için bayrak

// --- DOM Elemanları ---
const bird = document.getElementById("bird");
const scoreText = document.getElementById("score-text");
const timeText = document.getElementById("time-text");
const touchLayer = document.getElementById("touch-layer");
const gameOverScreen = document.getElementById("game-over-screen");

const pipePairs = [
  { group: document.getElementById("pipe-pair-1"), top: document.getElementById("top-pipe-1"), bottom: document.getElementById("bottom-pipe-1"), x: 350, passed: false },
  { group: document.getElementById("pipe-pair-2"), top: document.getElementById("top-pipe-2"), bottom: document.getElementById("bottom-pipe-2"), x: 550, passed: false }
];

display.autoOff = false;

// --- SAAT ---
clock.granularity = "minutes";
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let mins = today.getMinutes();
  if (mins < 10) { mins = "0" + mins; }
  timeText.text = `${hours}:${mins}`;
};

function init() {
  resetGame();
  touchLayer.onclick = () => {
    if (isGameOver) {
      resetGame();
    } else if (!isPlaying) {
      isPlaying = true;
      gameLoop();
      velocity = LIFT;
    } else {
      velocity = LIFT;
    }
  };
}

function gameLoop() {
  if (isGameOver) return;
  updateBird();
  updatePipes();
  checkCollisions();
  animationFrameRequest = requestAnimationFrame(gameLoop);
}

function updateBird() {
  velocity += GRAVITY;
  birdY += velocity;

  // Zemin ve Tavan
  if (birdY + (BIRD_HEIGHT / 2) >= GROUND_Y) { 
    birdY = GROUND_Y - (BIRD_HEIGHT / 2);
    gameOver();
  }
  if (birdY - (BIRD_HEIGHT / 2) < 0) {
    birdY = BIRD_HEIGHT / 2;
    velocity = 0;
  }
  
  bird.y = birdY - (BIRD_HEIGHT / 2);

  // Animasyon
  if (velocity < -2) {
    bird.href = "bird-down.png";
  } else if (velocity > 2) {
    bird.href = "bird-up.png";
  } else {
    bird.href = "bird-mid.png";
  }
}

function updatePipes() {
  // ZORLUK KONTROLÜ
  // Skor 10'u geçtiyse ve henüz hızlanmadıysa
  if (score > 10 && !isHardMode) {
    currentPipeSpeed = 4.5; // Hızı artır (3.5 -> 4.5)
    isHardMode = true;
  }

  pipePairs.forEach(pair => {
    pair.x -= currentPipeSpeed;

    if (pair.x < -PIPE_TOTAL_WIDTH) { 
      pair.x = 350;
      pair.passed = false;
      randomizePipeHeights(pair);
    }

    pair.group.groupTransform.translate.x = pair.x;

    if (!pair.passed && pair.x < BIRD_X_POS - PIPE_TOTAL_WIDTH) {
      score++;
      scoreText.text = score;
      pair.passed = true;
    }
  });
}

function setPipeHeight(pipeElement, height, isTopPipe) {
  const body = pipeElement.getElementById("body");
  const bodyHighlight = pipeElement.getElementById("body-highlight"); // Parlama şeridi
  const cap = pipeElement.getElementById("cap");
  const capHighlight = pipeElement.getElementById("cap-highlight");

  const bodyHeight = Math.max(0, height - PIPE_CAP_HEIGHT);
  
  // Hem gövdenin hem de üzerindeki parlama şeridinin boyunu ayarla
  body.height = bodyHeight;
  bodyHighlight.height = bodyHeight; // Şeridi de uzat!

  if (isTopPipe) {
    cap.y = bodyHeight;
    capHighlight.y = bodyHeight; // Kapağın parlamasını da taşı
  }
}

function randomizePipeHeights(pair) {
  let topTotalHeight = Math.floor(Math.random() * (GROUND_Y - GAP_SIZE - 80)) + 50;
  setPipeHeight(pair.top, topTotalHeight, true);
  
  const bottomY = topTotalHeight + GAP_SIZE;
  let bottomTotalHeight = GROUND_Y - bottomY;
  if (bottomTotalHeight < PIPE_CAP_HEIGHT) bottomTotalHeight = PIPE_CAP_HEIGHT;

  pair.bottom.y = bottomY;
  setPipeHeight(pair.bottom, bottomTotalHeight, false);
}

function checkCollisions() {
  const bx = BIRD_X_POS;
  const by = bird.y;
  const bw = BIRD_WIDTH;
  const bh = BIRD_HEIGHT;
  const padding = 5; 

  pipePairs.forEach(pair => {
    const topHeight = pair.top.getElementById("body").height + PIPE_CAP_HEIGHT;
    // Üst Boru
    if (
      bx + padding < pair.x + PIPE_TOTAL_WIDTH &&
      bx + bw - padding > pair.x &&
      by + padding < topHeight
    ) {
      gameOver();
    }
    // Alt Boru
    if (
      bx + padding < pair.x + PIPE_TOTAL_WIDTH &&
      bx + bw - padding > pair.x &&
      by + bh - padding > pair.bottom.y
    ) {
      gameOver();
    }
  });
}

function gameOver() {
  isGameOver = true;
  isPlaying = false;
  cancelAnimationFrame(animationFrameRequest);
  gameOverScreen.style.display = "inline";
}

function resetGame() {
  isGameOver = false;
  score = 0;
  scoreText.text = "0";
  birdY = 168;
  velocity = 0;
  
  // Ayarları Sıfırla
  currentPipeSpeed = INITIAL_SPEED;
  isHardMode = false;
  
  bird.href = "bird-mid.png"; 

  pipePairs[0].x = 350;
  randomizePipeHeights(pipePairs[0]);
  pipePairs[1].x = 550;
  randomizePipeHeights(pipePairs[1]);
  
  bird.y = birdY - (BIRD_HEIGHT / 2);
  pipePairs.forEach(p => {
    p.group.groupTransform.translate.x = p.x;
  });

  gameOverScreen.style.display = "none";
}

init();
