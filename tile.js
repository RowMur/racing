const TILE_COLOR = "lightgrey";
const CURB_COLORS = ["red", "white"];
const CURB_WIDTH = 0.1;
const FINISH_LINE_COLORS = ["black", "white"];

const TILE_DIRECTIONS = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

function getOppositeDirection(direction) {
  switch (direction) {
    case "UP":
      return "DOWN";
    case "DOWN":
      return "UP";
    case "LEFT":
      return "RIGHT";
    case "RIGHT":
      return "LEFT";
    default:
      throw new Error("Invalid direction");
  }
}

class Tile {
  constructor(x, y, from, to) {
    this.x = x;
    this.y = y;

    this.from = from || "LEFT";
    const wantTo = to || "RIGHT";
    this.to = wantTo === this.from ? getOppositeDirection(this.from) : wantTo;
  }

  updateDirections(newFrom, newTo) {
    if (!newFrom && !newTo) {
      return;
    }

    if (newFrom && newTo) {
      if (newFrom === newTo) {
        this.from = newFrom;
        this.to = getOppositeDirection(newFrom);
        return;
      }

      this.from = newFrom;
      this.to = newTo;
      return;
    }

    if (newFrom) {
      this.from = newFrom;
      if (this.from === this.to) {
        this.to = getOppositeDirection(newFrom);
      }
      return;
    }

    if (newTo) {
      this.to = newTo;
      if (this.from === this.to) {
        this.from = getOppositeDirection(newTo);
      }
      return;
    }
  }

  draw(ctx, x, y, size, isStartFinish) {
    ctx.fillStyle = TILE_COLOR;
    ctx.fillRect(x, y, size, size);

    const curbSize = size * CURB_WIDTH;

    if (isStartFinish) {
      if (this.from === "LEFT" || this.from === "RIGHT") {
        for (let i = 0; i < size / curbSize; i++) {
          ctx.fillStyle = FINISH_LINE_COLORS[i % FINISH_LINE_COLORS.length];
          ctx.fillRect(x, y + i * curbSize, curbSize, curbSize);
        }
        for (let i = 0; i < size / curbSize; i++) {
          ctx.fillStyle =
            FINISH_LINE_COLORS[(i + 1) % FINISH_LINE_COLORS.length];
          ctx.fillRect(x + curbSize, y + i * curbSize, curbSize, curbSize);
        }
      }
      if (this.from === "UP" || this.from === "DOWN") {
        for (let i = 0; i < size / curbSize; i++) {
          ctx.fillStyle = FINISH_LINE_COLORS[i % FINISH_LINE_COLORS.length];
          ctx.fillRect(x + i * curbSize, y, curbSize, curbSize);
        }
        for (let i = 0; i < size / curbSize; i++) {
          ctx.fillStyle =
            FINISH_LINE_COLORS[(i + 1) % FINISH_LINE_COLORS.length];
          ctx.fillRect(x + i * curbSize, y + curbSize, curbSize, curbSize);
        }
      }
    }

    if (this.from !== "LEFT" && this.to !== "LEFT") {
      // Draw left curb
      for (let i = 0; i < size / curbSize; i++) {
        ctx.fillStyle = CURB_COLORS[i % CURB_COLORS.length];
        ctx.fillRect(x, y + i * curbSize, curbSize, curbSize);
      }
    }

    if (this.from !== "RIGHT" && this.to !== "RIGHT") {
      // Draw right curb
      for (let i = 0; i < size / curbSize; i++) {
        ctx.fillStyle = CURB_COLORS[i % CURB_COLORS.length];
        ctx.fillRect(x + size - curbSize, y + i * curbSize, curbSize, curbSize);
      }
    }

    if (this.from !== "UP" && this.to !== "UP") {
      // Draw top curb
      for (let i = 0; i < size / curbSize; i++) {
        ctx.fillStyle = CURB_COLORS[i % CURB_COLORS.length];
        ctx.fillRect(x + i * curbSize, y, curbSize, curbSize);
      }
    }

    if (this.from !== "DOWN" && this.to !== "DOWN") {
      // Draw bottom curb
      for (let i = 0; i < size / curbSize; i++) {
        ctx.fillStyle = CURB_COLORS[i % CURB_COLORS.length];
        ctx.fillRect(x + i * curbSize, y + size - curbSize, curbSize, curbSize);
      }
    }
  }
}
