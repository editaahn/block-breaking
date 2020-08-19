const canvas = document.querySelector("canvas");

canvas.width = 400;
canvas.height = 650;

const c = canvas.getContext("2d");
let score = 0;
let scoreNow = document.getElementById("scoreBoard").querySelector("b");
let blocksLength = document.getElementById("scoreBoard").querySelector("em");

const messageContainer = document.getElementById('afterGame');
const message = document.getElementById('message');

const RIGHT_KEYCODE = 39,
  LEFT_KEYCODE = 37,
  DISTANCE = 20;

// DEFINE SUPPORT
class Support {
  constructor() {
    this.x = 150;
    this.y = 600;
    this.width = 100;
    this.height = 20;
    this.update();
  }
  draw() {
    const { x, y, width, height } = this;
    c.beginPath();
    c.rect(x, y, width, height, 10);
    c.fillStyle = "#F2B5A7";
    c.fill();
    c.closePath();
  }
  update() {
    window.addEventListener("keydown", (e) => {
      c.clearRect(this.x, this.y, this.width, this.height);
      if (e.keyCode == RIGHT_KEYCODE && this.x < canvas.width - this.width)
        this.x += DISTANCE;
      else if (e.keyCode == LEFT_KEYCODE && this.x > 0) this.x -= DISTANCE;
      this.draw();
    });
  }
}

// CREATE SUPPORT
const support = new Support();
support.draw();

// DEFINE BALL
class Ball {
  constructor() {
    this.radius = 10;
    this.x = 200; //center of a ball : x
    this.y = 450; //center of a ball : y
    this.dx = 0; //velocity for x direction
    this.dy = 5; //velocity for y direction
    this.hitblock = false;
  }
  draw() {
    const { x, y, radius } = this;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2);
    c.fillStyle = "#ffffff";
    c.fill();
    c.closePath();
  }
  changeYdirection() {
    this.dy = -this.dy;
  }
  update() {
    const bottomY = this.y + this.radius;

    c.clearRect(
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );

    //Y bouncing
    if (
      this.y == this.radius || //hit the ceiling
      (this.x + this.radius >= support.x && //hit 
        this.x - this.radius <= support.x + 100 &&
        bottomY == support.y)
    ) {
      this.changeYdirection();
    } else if (this.hitblock) {
      this.hitblock = false;
      this.changeYdirection();
    }

    //X bouncing
    if (this.x < support.x + 40 && bottomY == support.y) {
      this.dx = 5;
      this.dx = -this.dx;
    } else if (this.x > support.x * 1.5 && bottomY == support.y) {
      this.dx = 5;
    } else if (
      this.x == this.radius ||
      this.x == canvas.width - this.radius ||
      this.x + this.width == support.x
    ) {
      this.dx = -this.dx;
    }

    this.y += this.dy;
    this.x += this.dx;

    this.draw();
  }
}

// CREATE BALL
const ball = new Ball();
ball.draw();

// DEFINE BLOCK
class Block {
  constructor() {
    this.width = 80;
    this.height = 30;
    this.x = 0;
    this.y = 0;
  }
  draw() {
    c.beginPath();
    c.rect(this.x, this.y, this.width, this.height);
    c.strokeStyle = "#5C51A6";
    c.stroke();
    c.lineWidth = 4;
    c.fill();
    c.closePath();
  }
  remove() {
    c.clearRect(this.x, this.y, this.width, this.height);
    this.x = -10;
    this.y = -10;
    this.width = 0;
    this.height = 0;
  }
}

// CREATE BLOCKS
const blocks = [];
const COLUMN = 5;
for (let i = 0; i < COLUMN * 8; ++i) {
  blocks.push(new Block());
  const rowNum = Math.floor(i / COLUMN);
  blocks[i].x = blocks[i].width * i;

  if (rowNum > 0) blocks[i].x = blocks[i].width * (i % COLUMN);

  blocks[i].y = rowNum * blocks[i].height;
  c.fillStyle = i % 2 == 1 ? "#9CD3D9" : "#958ABF";

  blocks[i].draw();
}


blocksLength.textContent = `${blocks.length}`;


// ANIMATING BALL
function animatingBall() {
  if (score == blocks.length) {
    messageContainer.style.display = 'flex';
    message.textContent += 'Clear!';
    window.cancelAnimationFrame();
  } else if (ball.y + ball.radius == canvas.height) {
    messageContainer.style.display = 'flex';
    message.textContent += 'Fail!';
    window.cancelAnimationFrame();
  }

  window.requestAnimationFrame(animatingBall);

  ball.update();

  for (const block of blocks) {
    const { x, y, width, height } = block;
    if (
      ((ball.y - ball.radius == y + height || y == ball.y + ball.radius) && // y info. when the ball meets each block
        ball.x + ball.radius >= x && // 
        ball.x - ball.radius <= x + width) ||
      ((ball.x - ball.radius == x + width || x == ball.x + ball.radius) &&
        ball.y + ball.radius >= y &&
        ball.y - ball.radius <= y + height)
    ) {
      ball.hitblock = true;
      block.remove();
      ++score;
      scoreNow.textContent = scoreNow.textContent * 1 + 1;
    }
  }
}

let playable = true;

//START
window.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && playable == true) {
    playable = false;
    const sentense = document.getElementById("beforeStart");
    sentense.style.display = "none";
    animatingBall();
  }
});
