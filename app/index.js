import document from "document";
import { display } from "display";

// --- Ayarlar ---
const GRAVITY = 0.6;
const LIFT = -8;
const PIPE_SPEED = 3;
const GAP_SIZE = 110;
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300;

// --- YENİ: Kuş Görsel Ayarları ---
const BIRD_WIDTH = 34;    // Resim genişliği
const BIRD_HEIGHT = 24;   // Resim yüksekliği
const BIRD_X_POS = 63;    // Resmin sabit X pozisyonu (sol kenar)

// --- Değişkenler ---
let birdY = 168; // Kuşun MERKEZ Y noktası (Fizik için)
let velocity = 0;
let score = 0;
let isGameOver = false;
let isPlaying = false;
let animationFrameRequest;

// --- DOM Elemanları ---
const bird = document.getElementById("bird"); // Artık bir <image> elementi
const scoreText = document.getElementById("score-text");
const touchLayer = document.getElementById("touch-layer");
const gameOverScreen = document.getElementById("game-over-screen");

const pipes = [
  { top: document.getElementById("top-pipe-1"), bottom: document.getElementById("bottom-pipe-1"), x: 350, passed: false },
  { top: document.getElementById("top-pipe-2"), bottom: document.getElementById("bottom-pipe-2"), x: 550, passed: false }
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

// --- YENİ: Kuş Hareketi Güncellemesi ---
function updateBird() {
  velocity += GRAVITY;
  birdY += velocity; // Fizik merkez noktaya uygulanır

  // Zemin kontrolü (Merkez noktasına göre hesaplama)
  // Kuşun alt kenarı (merkez + yarı yükseklik) zemine değdi mi?
  if (birdY + (BIRD_HEIGHT / 2) >= GROUND_Y) {
    birdY = GROUND_Y - (BIRD_HEIGHT / 2);
    gameOver();
  }
  
  // Tavan kontrolü (Opsiyonel)
  if (birdY - (BIRD_HEIGHT / 2) < 0) {
     birdY = BIRD_HEIGHT / 2;
     velocity = 0;
  }

  // ÖNEMLİ: Görüntüyü güncelleme
  // Resmin 'y' özelliği sol üst köşedir. Merkezden yarı yüksekliği çıkarıyoruz.
  bird.y = birdY - (BIRD_HEIGHT / 2);
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;
    if (pipe.x < -50) {
      pipe.x = 350;
      pipe.passed = false;
      randomizePipeHeight(pipe);
    }
    pipe.top.x = pipe.x;
    pipe.bottom.x = pipe.x;

    // Skor mantığı: Kuşun sol kenarı (BIRD_X_POS) boruyu geçti mi?
    if (!pipe.passed && pipe.x < BIRD_X_POS - 50) {
      score++;
      scoreText.text = score;
      pipe.passed = true;
    }
  });
}

function randomizePipeHeight(pipeObj) {
  let topHeight = Math.floor(Math.random() * (GROUND_Y - GAP_SIZE - 100)) + 50;
  pipeObj.top.height = topHeight;
  pipeObj.bottom.y = topHeight + GAP_SIZE;
  pipeObj.bottom.height = GROUND_Y - (topHeight + GAP_SIZE);
}

// --- YENİ: Çarpışma Kontrolü (Resim Kutusuna Göre) ---
function checkCollisions() {
  // Kuşun hitbox'ı (artık resmin kendisi)
  const bx = BIRD_X_POS;     // Sol kenar
  // by: Resmin şu anki üst kenarı (DOM'dan okuyoruz)
  const by = bird.y;         
  const bw = BIRD_WIDTH;     // Genişlik
  const bh = BIRD_HEIGHT;    // Yükseklik
  
  // Hitbox toleransı (biraz daha affedici olması için)
  const padding = 2;

  pipes.forEach(pipe => {
    // Üst Boru Kontrolü
    if (
      bx + padding < pipe.x + 50 &&
      bx + bw - padding > pipe.x &&
      by + padding < pipe.top.height
    ) {
      gameOver();
    }

    // Alt Boru Kontrolü
    if (
      bx + padding < pipe.x + 50 &&
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
  birdY = 168; // Merkeze sıfırla
  velocity = 0;
  
  pipes[0].x = 350;
  randomizePipeHeight(pipes[0]);
  pipes[1].x = 550;
  randomizePipeHeight(pipes[1]);
  
  // Görseli güncelle
  bird.y = birdY - (BIRD_HEIGHT / 2);
  pipes.forEach(p => {
    p.top.x = p.x;
    p.bottom.x = p.x;
  });

  gameOverScreen.style.display = "none";
}

init();
