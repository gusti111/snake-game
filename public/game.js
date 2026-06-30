// game.js
// Logika utama Snake Game menggunakan HTML5 Canvas API

// =====================
// [PERCOBAAN] SETUP CANVAS
// =====================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// [UPGRADE LATIHAN] REFERENSI ELEMEN PANEL LEVEL
// =====================
const levelPanel = document.getElementById("levelPanel");
const levelText = document.getElementById("levelText");
const scoreText = document.getElementById("scoreText");
const nextLevelBtn = document.getElementById("nextLevelBtn");

// =====================
// STATE MANAGEMENT & DATA GAME
// =====================
let snake = [{ x: 200, y: 200 }];
let dx = 20;
let dy = 0;
let food = generateFood();
let score = 0;

let gameOver = false;
let level = "Easy";
let gameSpeed = 200; // Easy=200, Medium=150, Hard=75

let pauseLevel = false; // Pause saat transisi level
let isPaused = false;   // Pause manual oleh pemain
let isChangingDirection = false; // Lock sistem untuk mencegah input ganda
let loopTimer; // Menyimpan ID setTimeout

// =====================
// FUNGSI GENERATE FOOD
// =====================
function generateFood() {
  return {
    x: Math.floor(Math.random() * 20) * 20,
    y: Math.floor(Math.random() * 20) * 20
  };
}

// =====================
// FUNGSI RENDER (DRAW)
// =====================
function drawSnake() {
  snake.forEach(function (part) {
    ctx.fillStyle = "green";
    ctx.fillRect(part.x, part.y, 20, 20);
    ctx.strokeStyle = "#003300";
    ctx.strokeRect(part.x, part.y, 20, 20);
  });
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 20, 20);
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Level: " + level, 300, 20);
}

function drawGameOver() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("GAME OVER", 110, 200);
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 150, 230);
  ctx.font = "14px Arial";
  ctx.fillText("Tekan Enter untuk Restart", 120, 260);
}

function drawPaused() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("PAUSED", 140, 200);
  ctx.font = "16px Arial";
  ctx.fillText("Tekan Enter untuk Melanjutkan", 90, 240);
}

// =====================
// LOGIKA PERGERAKAN & TABRAKAN
// =====================
function moveSnake() {
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (level === "Easy" || level === "Medium") {
    if (head.x >= canvas.width) head.x = 0;
    if (head.x < 0) head.x = canvas.width - 20;
    if (head.y >= canvas.height) head.y = 0;
    if (head.y < 0) head.y = canvas.height - 20;
  } else {
    // Skenario Hard: Tabrak dinding
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
      gameOver = true;
    }
  }

  snake.unshift(head);
  snake.pop();
}

function checkFood() {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    snake.push({});
    food = generateFood();
    score += 1;
    checkLevelUp();
  }
}

// Skenario 6 & 7: Threshold Level diubah sesuai Black Box Testing
function checkLevelUp() {
  if (score > 50 && level === "Easy") {
    showLevelPanel("Medium");
  } else if (score > 100 && level === "Medium") {
    showLevelPanel("Hard");
  }
}

function showLevelPanel(newLevel) {
  pauseLevel = true;
  level = newLevel;
  if (level === "Medium") gameSpeed = 150;
  if (level === "Hard") gameSpeed = 75;

  levelPanel.classList.remove("hidden");
  levelText.innerText = "LEVEL " + level;
  scoreText.innerText = "Score saat ini: " + score;
}

// Skenario 8: Tabrak badan sendiri
function checkCollision() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true;
    }
  }
}

// =====================
// KONTROL INPUT
// =====================
document.addEventListener("keydown", function (event) {
  const key = event.key;

  // Fitur Pause Manual
  if (key === " ") {
    if (!gameOver && !pauseLevel) {
      isPaused = true;
      clearTimeout(loopTimer); // Hentikan siklus loop secara absolut
      drawPaused();
    }
    return;
  }

  // Fitur Resume / Restart / Lanjut Level
  if (key === "Enter") {
    if (gameOver) {
      location.reload(); // Skenario 10: Restart
    } else if (isPaused) {
      isPaused = false;
      gameLoop(); // Lanjutkan game
    } else if (pauseLevel) {
      pauseLevel = false;
      levelPanel.classList.add("hidden");
      gameLoop();
    }
    return;
  }

  // Kunci input jika game terhenti atau pemain sudah menekan arah di frame ini
  if (isChangingDirection || isPaused || pauseLevel || gameOver) return;

  // Skenario 1-4: Gerak ular
  if (key === "ArrowUp" && dy === 0) {
    dx = 0; dy = -20; isChangingDirection = true;
  }
  else if (key === "ArrowDown" && dy === 0) {
    dx = 0; dy = 20; isChangingDirection = true;
  }
  else if (key === "ArrowLeft" && dx === 0) {
    dx = -20; dy = 0; isChangingDirection = true;
  }
  else if (key === "ArrowRight" && dx === 0) {
    dx = 20; dy = 0; isChangingDirection = true;
  }
});

canvas.addEventListener("click", function (event) {
  if (gameOver) { location.reload(); return; }
  if (isChangingDirection || isPaused || pauseLevel) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const diffX = mouseX - snake[0].x;
  const diffY = mouseY - snake[0].y;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    dx = diffX > 0 ? 20 : -20; dy = 0; isChangingDirection = true;
  } else {
    dx = 0; dy = diffY > 0 ? 20 : -20; isChangingDirection = true;
  }
});

// =====================
// Skenario 9: Tombol Lanjut Level
// =====================
nextLevelBtn.addEventListener("click", function () {
  if (pauseLevel) {
    pauseLevel = false;
    levelPanel.classList.add("hidden");
    gameLoop();
  }
});

// =====================
// GAME LOOP UTAMA
// =====================
function gameLoop() {
  if (pauseLevel || isPaused) return;

  // Buka kunci input saat frame baru dirender
  isChangingDirection = false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    drawGameOver();
    return;
  }

  moveSnake();
  checkFood();
  checkCollision();

  drawSnake();
  drawFood();
  drawScore();

  loopTimer = setTimeout(gameLoop, gameSpeed);
}

// Mulai game
gameLoop();