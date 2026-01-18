import document from "document";
import { display } from "display";
import clock from "clock"; // Saati kullanmak için

// --- AYARLAR ---
const GRAVITY = 0.7;
const LIFT = -9;
const PIPE_SPEED = 3.5;
const GAP_SIZE = 110; 
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300;

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

// --- DOM Elemanları ---
const bird = document.getElementById("bird");
const scoreText = document.getElementById("score-text");
const timeText = document.getElementById("time-text"); // Saat elementi
const touchLayer = document.getElementById("touch-layer");
const gameOverScreen = document.getElementById("game-over-screen");

// Boru Grupları
const pipePairs = [
  { group: document.getElementById("pipe-pair-1"), top: document.getElementById("top-pipe-1"), bottom: document.getElementById("bottom-pipe-1"), x: 350, passed: false },
  { group: document.getElementById("pipe-pair-2"), top: document.getElementById("top-pipe-2"), bottom: document.getElementById("bottom-pipe-2"), x: 550, passed: false }
];

display.autoOff = false;

// --- SAAT AYARLARI ---
clock.granularity = "minutes"; // Dakikada bir güncelle
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let mins = today.getMinutes();
  // Saati düzgün formatla (örn: 9:05)
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

  // Zemin Kontrolü
  if (birdY + (BIRD_HEIGHT / 2) >= GROUND_Y) { 
    birdY = GROUND_Y - (BIRD_HEIGHT / 2);
    gameOver();
  }
  // Tavan Kontrolü
  if (birdY - (BIRD_HEIGHT / 2) < 0) {
    birdY = BIRD_HEIGHT / 2;
    velocity = 0;
  }
  
  // Pozisyonu Güncelle
  bird.y = birdY - (BIRD_HEIGHT / 2);

  // --- KUŞ ANİMASYONU ---
  // Yukarı çıkıyorsa (Hız negatif) -> Kanatlar Aşağı (Güç alıyor)
  // Aşağı düşüyorsa (Hız pozitif) -> Kanatlar Yukarı (Süzülüyor)
  // Duruyorsa -> Kanatlar Ortada
  
  if (velocity < -2) {
    bird.href = "bird-down.png";
  } else if (velocity > 2) {
    bird.href = "bird-up.png";
  } else {
    bird.href = "bird-mid.png";
  }
}

function updatePipes() {
  pipePairs.forEach(pair => {
    pair.x -= PIPE_SPEED;

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
  const cap = pipeElement.getElementById("cap");
  const bodyHeight = Math.max(0, height - PIPE_CAP_HEIGHT);
  
  body.height = bodyHeight;

  if (isTopPipe) {
    cap.y = bodyHeight;
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
  const padding = 5; // Tolerans

  pipePairs.forEach(pair => {
    // Üst Boru Çarpışma
    const topHeight = pair.top.getElementById("body").height + PIPE_CAP_HEIGHT;
    if (
      bx + padding < pair.x + PIPE_TOTAL_WIDTH &&
      bx + bw - padding > pair.x &&
      by + padding < topHeight
    ) {
      gameOver();
    }

    // Alt Boru Çarpışma
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
  
  // Kuşu orta duruşa getir
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
