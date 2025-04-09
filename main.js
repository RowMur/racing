const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const editor = new Editor(canvas.clientWidth / 2, canvas.clientHeight / 2);
editor.init(ctx);

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", () => {
  editor.save();
});

animate();

function animate() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  editor.update(ctx);
  editor.draw(ctx);
  requestAnimationFrame(animate);
}
