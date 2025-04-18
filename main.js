const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const game = new Game(canvas.clientWidth / 2, canvas.clientHeight / 2);
game.init();

animate();

function animate() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  game.update(ctx);
  game.draw(ctx);
  requestAnimationFrame(animate);
}
