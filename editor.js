class Editor {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.interval = 80;
    this.gridBorderColor = "lightgrey";
    this.selectedColor = "grey";

    this.state = new Set();
  }

  #stateKeyFromCoords(x, y) {
    return `${x},${y}`;
  }

  #getCoordsFromStateKey(key) {
    const coords = key.split(",");
    return {
      x: parseInt(coords[0], 10),
      y: parseInt(coords[1], 10),
    };
  }

  #getState(x, y) {
    const key = this.#stateKeyFromCoords(x, y);
    return this.state.has(key);
  }

  #setState(x, y, value) {
    const key = this.#stateKeyFromCoords(x, y);
    if (value) {
      this.state.add(key);
    } else {
      this.state.delete(key);
    }
  }

  init() {
    this.state.clear();
    window.addEventListener("click", (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this.interval);
      const y = Math.floor((e.clientY - rect.top) / this.interval);
      this.#setState(x, y, !this.#getState(x, y));
    });
  }

  draw(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    for (let i = 0; i < width; i += this.interval) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.strokeStyle = this.gridBorderColor;
      ctx.stroke();
    }
    for (let i = 0; i < height; i += this.interval) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.strokeStyle = this.gridBorderColor;
      ctx.stroke();
    }

    for (const key of this.state) {
      const { x, y } = this.#getCoordsFromStateKey(key);
      ctx.fillStyle = this.selectedColor;
      ctx.fillRect(
        x * this.interval,
        y * this.interval,
        this.interval,
        this.interval
      );
    }
  }
}
