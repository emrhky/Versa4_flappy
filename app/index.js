import document from "document";
import { display } from "display";

// --- Ayarlar ---
const GRAVITY = 0.6;
const LIFT = -8;
const PIPE_SPEED = 3;
const GAP_SIZE = 110; 
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300; // Zeminin başladığı Y noktası

// --- Görsel Boyutları ---
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X_POS = 63;
const PIPE_WIDTH = 52; 

// --- Değişkenler ---
let birdY = 168;
let velocity = 0;
let score = 0;
let isGameOver = false;
let isPlaying = false;
let animationFrameRequest;

// --- DOM Elemanları ---
const bird = document.getElementById("bird");
const scoreText = document.getElementById("score-text");
const touchLayer = document.getElementById("touch-layer");
const gameOverScreen = document.getElementById("game-over-screen");

// Boru Nesneleri
const pipes = [
  {
    top: document.getElementById("top-pipe-1"),
    bottom: document.getElementById("bottom-pipe-1"),
    x: 350,
    passed: false
  },
  {
    top: document.getElementById("top-pipe-2"),
    bottom: document.getElementById("bottom-pipe-2"),
    x: 550,
    passed: false
  }
];

display.autoOff = false;

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

  // Zemin Çarpışması
  if (birdY + (BIRD_HEIGHT / 2) >= GROUND_Y) { 
    birdY = GROUND_Y - (BIRD_HEIGHT / 2);
    gameOver();
  }
  
  // Tavan Sınırı
  if (birdY - (BIRD_HEIGHT / 2) < 0) {
    birdY = BIRD_HEIGHT / 2;
    velocity = 0;
  }

  bird.y = birdY - (BIRD_HEIGHT / 2);
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;

    // Boru ekran dışına çıkınca başa sar
    if (pipe.x < -PIPE_WIDTH) { 
      pipe.x = 350;
      pipe.passed = false;
      randomizePipeHeight(pipe);
    }

    pipe.top.x = pipe.x;
    pipe.bottom.x = pipe.x;

    // Skor Mantığı
    if (!pipe.passed && pipe.x < BIRD_X_POS - PIPE_WIDTH) {
      score++;
      scoreText.text = score;
      pipe.passed = true;
    }
  });
}

function randomizePipeHeight(pipeObj) {
  // Rastgele bir üst boru yüksekliği üret
  let topHeight = Math.floor(Math.random() * (GROUND_Y - GAP_SIZE - 60)) + 40;
  
  // Üst boruyu ayarla
  pipeObj.top.height = topHeight;
  
  // Alt boruyu ayarla
  // Alt borunun Y noktası = Üst boru boyu + Boşluk
  pipeObj.bottom.y = topHeight + GAP_SIZE;
  
  // Alt borunun boyu = (Zemin - Başladığı Yer)
  // Negatif değer çıkmaması için max kontrolü
  let bottomHeight = GROUND_Y - (topHeight + GAP_SIZE);
  if (bottomHeight < 0) bottomHeight = 0;
  
  pipeObj.bottom.height = bottomHeight;
}

function checkCollisions() {
  const bx = BIRD_X_POS;
  const by = bird.y;
  const bw = BIRD_WIDTH;
  const bh = BIRD_HEIGHT;
  const padding = 4; // Hitbox toleransı

  pipes.forEach(pipe => {
    // Üst Boru Çarpışma
    if (
      bx + padding < pipe.x + PIPE_WIDTH &&
      bx + bw - padding > pipe.x &&
      by + padding < pipe.top.height
    ) {
      gameOver();
    }

    // Alt Boru Çarpışma
    if (
      bx + padding < pipe.x + PIPE_WIDTH &&
      bx + bw - padding > pipe.x &&
      by + bh - padding > pipe.bottom.y
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
  
  // Boruları sıfırla
  pipes[0].x = 350;
  randomizePipeHeight(pipes[0]);
  
  pipes[1].x = 550;
  randomizePipeHeight(pipes[1]);
  
  bird.y = birdY - (BIRD_HEIGHT / 2);
  pipes.forEach(p => {
    p.top.x = p.x;
    p.bottom.x = p.x;
  });

  gameOverScreen.style.display = "none";
}

init();
