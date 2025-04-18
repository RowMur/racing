class Race {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.fillText("race screen", this.x, this.y);
  }
}
