import document from "document";
import { display } from "display";

// --- Ayarlar ---
const GRAVITY = 0.6;
const LIFT = -8;       // Zıplama gücü
const PIPE_SPEED = 3;  // Boruların kayma hızı
const GAP_SIZE = 110;  // Borular arası boşluk
const BIRD_X = 80;     // Kuşun sabit yatay konumu
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300;

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

// Boru Nesneleri (Pooling)
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
    x: 550, // İkinci boru daha geriden başlar
    passed: false
  }
];

// Ekranın kapanmasını engelle (Oyun sırasında)
display.autoOff = false;

// --- Başlatma ---
function init() {
  resetGame();
  
  // Dokunma kontrolü
  touchLayer.onclick = () => {
    if (isGameOver) {
      resetGame();
    } else if (!isPlaying) {
      isPlaying = true;
      gameLoop();
      velocity = LIFT;
    } else {
      velocity = LIFT; // Zıpla
    }
  };
}

// --- Oyun Döngüsü ---
function gameLoop() {
  if (isGameOver) return;

  updateBird();
  updatePipes();
  checkCollisions();

  // Döngüyü tekrar çağır
  animationFrameRequest = requestAnimationFrame(gameLoop);
}

// --- Kuş Hareketi ---
function updateBird() {
  velocity += GRAVITY;
  birdY += velocity;

  // Zemin kontrolü
  if (birdY >= GROUND_Y - 12) { 
    birdY = GROUND_Y - 12;
    gameOver();
  }
  
  // Tavan kontrolü (opsiyonel)
  if (birdY < 0) {
    birdY = 0;
    velocity = 0;
  }

  bird.cy = birdY;
}

// --- Boru Mantığı ---
function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;

    // Boru ekranın solundan çıktıysa başa sar ve yüksekliği değiştir
    if (pipe.x < -50) {
      pipe.x = 350; // Ekranın sağına geri at
      pipe.passed = false;
      randomizePipeHeight(pipe);
    }

    // Görsel güncelleme
    pipe.top.x = pipe.x;
    pipe.bottom.x = pipe.x;

    // Skor Sayma
    if (!pipe.passed && pipe.x < BIRD_X - 50) {
      score++;
      scoreText.text = score;
      pipe.passed = true;
    }
  });
}

// --- Rastgele Yükseklik ---
function randomizePipeHeight(pipeObj) {
  // Rastgele bir üst boru yüksekliği (Min 50, Max 150 gibi)
  let topHeight = Math.floor(Math.random() * (GROUND_Y - GAP_SIZE - 100)) + 50;
  
  pipeObj.top.height = topHeight;
  
  // Alt borunun Y pozisyonu
  pipeObj.bottom.y = topHeight + GAP_SIZE;
  // Alt borunun boyu
  pipeObj.bottom.height = GROUND_Y - (topHeight + GAP_SIZE);
}

// --- Çarpışma Kontrolü (AABB) ---
function checkCollisions() {
  // Kuşun sınırları
  const bx = BIRD_X - 10; // Biraz tolerans (hitbox küçültme)
  const by = birdY - 10;
  const bw = 20;
  const bh = 20;

  pipes.forEach(pipe => {
    // Üst Boru Kontrolü
    if (
      bx < pipe.x + 50 &&
      bx + bw > pipe.x &&
      by < pipe.top.height
    ) {
      gameOver();
    }

    // Alt Boru Kontrolü
    if (
      bx < pipe.x + 50 &&
      bx + bw > pipe.x &&
      by + bh > pipe.bottom.y
    ) {
      gameOver();
    }
  });
}

// --- Game Over ---
function gameOver() {
  isGameOver = true;
  isPlaying = false;
  cancelAnimationFrame(animationFrameRequest);
  gameOverScreen.style.display = "inline";
}

// --- Oyunu Sıfırla ---
function resetGame() {
  isGameOver = false;
  score = 0;
  scoreText.text = "0";
  birdY = 168;
  velocity = 0;
  
  // Boruları başlangıç pozisyonuna getir
  pipes[0].x = 350;
  randomizePipeHeight(pipes[0]);
  
  pipes[1].x = 550;
  randomizePipeHeight(pipes[1]);
  
  // Görsel güncelleme
  bird.cy = birdY;
  pipes.forEach(p => {
    p.top.x = p.x;
    p.bottom.x = p.x;
  });

  gameOverScreen.style.display = "none";
}

// Başlat
init();
