const TILE_COLOR = "lightgrey";

class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(ctx, x, y, size) {
    ctx.fillStyle = TILE_COLOR;
    ctx.fillRect(x, y, size, size);
  }
}
