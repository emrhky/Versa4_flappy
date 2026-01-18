import document from "document";
import { display } from "display";

// --- AYARLAR (HIZLANDIRILDI) ---
const GRAVITY = 0.7;    // Yerçekimi (0.6 -> 0.7)
const LIFT = -9;        // Zıplama Gücü (-8 -> -9)
const PIPE_SPEED = 3.5; // Boru Hızı (3 -> 3.5)

const GAP_SIZE = 110; 
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300;

// --- GÖRSEL BOYUTLARI ---
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X_POS = 63;
const PIPE_TOTAL_WIDTH = 52; // Kapağın genişliği
const PIPE_CAP_HEIGHT = 26;  // Kapağın yüksekliği

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

// Boru Çiftlerini Al (Grup olarak)
const pipePairs = [
  {
    group: document.getElementById("pipe-pair-1"),
    top: document.getElementById("top-pipe-1"),
    bottom: document.getElementById("bottom-pipe-1"),
    x: 350,
    passed: false
  },
  {
    group: document.getElementById("pipe-pair-2"),
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

  if (birdY + (BIRD_HEIGHT / 2) >= GROUND_Y) { 
    birdY = GROUND_Y - (BIRD_HEIGHT / 2);
    gameOver();
  }
  if (birdY - (BIRD_HEIGHT / 2) < 0) {
    birdY = BIRD_HEIGHT / 2;
    velocity = 0;
  }
  bird.y = birdY - (BIRD_HEIGHT / 2);
}

// --- YENİ: Boru Güncelleme Mantığı ---
function updatePipes() {
  pipePairs.forEach(pair => {
    pair.x -= PIPE_SPEED;

    // Boru ekran dışına çıkınca başa sar
    if (pair.x < -PIPE_TOTAL_WIDTH) { 
      pair.x = 350;
      pair.passed = false;
      randomizePipeHeights(pair);
    }

    // Grubu taşı (içindeki üst ve alt boru beraber hareket eder)
    pair.group.groupTransform.translate.x = pair.x;

    // Skor Mantığı
    if (!pair.passed && pair.x < BIRD_X_POS - PIPE_TOTAL_WIDTH) {
      score++;
      scoreText.text = score;
      pair.passed = true;
    }
  });
}

// --- YENİ: Yükseklik Ayarlama Fonksiyonu ---
function setPipeHeight(pipeElement, height, isTopPipe) {
  const body = pipeElement.getElementById("body");
  const cap = pipeElement.getElementById("cap");

  // Gövdenin boyunu ayarla (Kapak yüksekliğini çıkararak)
  const bodyHeight = Math.max(0, height - PIPE_CAP_HEIGHT);
  body.height = bodyHeight;

  if (isTopPipe) {
    // Üst boru: Kapağı gövdenin altına taşı
    cap.y = bodyHeight;
  } else {
    // Alt boru: Kapak zaten üstte (y=0), gövde onun altında başlar.
    // Ekstra bir işlem gerekmez.
  }
}

function randomizePipeHeights(pair) {
  // Rastgele bir üst boru toplam yüksekliği
  let topTotalHeight = Math.floor(Math.random() * (GROUND_Y - GAP_SIZE - 80)) + 50;
  
  // Üst boruyu ayarla
  setPipeHeight(pair.top, topTotalHeight, true);
  
  // Alt borunun Y pozisyonu ve yüksekliği
  const bottomY = topTotalHeight + GAP_SIZE;
  let bottomTotalHeight = GROUND_Y - bottomY;
  if (bottomTotalHeight < PIPE_CAP_HEIGHT) bottomTotalHeight = PIPE_CAP_HEIGHT; // Minimum boy

  // Alt boruyu ayarla ve konumlandır
  pair.bottom.y = bottomY;
  setPipeHeight(pair.bottom, bottomTotalHeight, false);
}

function checkCollisions() {
  const bx = BIRD_X_POS;
  const by = bird.y;
  const bw = BIRD_WIDTH;
  const bh = BIRD_HEIGHT;
  const padding = 4;

  pipePairs.forEach(pair => {
    // Üst Boru Çarpışma (pair.top'un toplam yüksekliğini kullan)
    const topHeight = pair.top.getElementById("body").height + PIPE_CAP_HEIGHT;
    if (
      bx + padding < pair.x + PIPE_TOTAL_WIDTH &&
      bx + bw - padding > pair.x &&
      by + padding < topHeight
    ) {
      gameOver();
    }

    // Alt Boru Çarpışma (pair.bottom.y pozisyonunu kullan)
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
