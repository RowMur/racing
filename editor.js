class Editor {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.interval = 80;
    this.gridBorderColor = "lightgrey";
    this.selectedColor = "grey";

    this.state = new Set();

    this.lastAdded = null;
    this.lastRemoved = null;
    this.isHoldingShift = false;

    this.zoom = 1;
    this.zoomMax = 2;
    this.zoomMin = 0.5;
    this.zoomStep = 0.1;
  }

  #zoomedInterval() {
    return this.interval * this.zoom;
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
      this.lastAdded = key;
      this.lastRemoved = null;
    } else {
      this.state.delete(key);
      this.lastAdded = null;
      this.lastRemoved = key;
    }
  }

  init() {
    this.state.clear();
    window.addEventListener("click", (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this.#zoomedInterval());
      const y = Math.floor((e.clientY - rect.top) / this.#zoomedInterval());
      if (!this.isHoldingShift) {
        this.#setState(x, y, !this.#getState(x, y));
        return;
      }

      if (this.lastAdded === null && this.lastRemoved === null) {
        return;
      }

      const isAdding = !!this.lastAdded;
      const lastKey = isAdding ? this.lastAdded : this.lastRemoved;

      const { x: lastX, y: lastY } = this.#getCoordsFromStateKey(lastKey);
      const minX = Math.min(x, lastX);
      const maxX = Math.max(x, lastX);
      const minY = Math.min(y, lastY);
      const maxY = Math.max(y, lastY);
      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          this.#setState(i, j, isAdding);
        }
      }
      this.lastAdded = this.#stateKeyFromCoords(x, y);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Shift") {
        this.isHoldingShift = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        this.isHoldingShift = false;
      }
    });

    window.addEventListener("wheel", (e) => {
      if (e.deltaY === 0) {
        return;
      }
      this.zoom += e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      this.zoom = Math.max(this.zoomMin, Math.min(this.zoomMax, this.zoom)); // Clamp zoom between 0.1 and 5
    });
  }

  draw(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    for (let i = 0; i < width; i += this.#zoomedInterval()) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.strokeStyle = this.gridBorderColor;
      ctx.stroke();
    }
    for (let i = 0; i < height; i += this.#zoomedInterval()) {
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
        x * this.#zoomedInterval(),
        y * this.#zoomedInterval(),
        this.#zoomedInterval(),
        this.#zoomedInterval()
      );
    }
  }
}
