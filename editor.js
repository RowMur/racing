class Editor {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.interval = 80;
    this.gridBorderColor = "lightgrey";
    this.selectedColor = "lightgrey";

    this.state = new Set();

    this.lastAdded = null;
    this.lastRemoved = null;
    this.isHoldingShift = false;

    this.zoom = 1;
    this.zoomMax = 2;
    this.zoomMin = 0.5;
    this.zoomStep = 0.1;

    this.camX = x;
    this.camY = y;

    this.isClicking = false;
    this.hasMovedDuringClick = false;
    this.clickOrigin = null;
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

  #scale() {
    return this.zoom / this.zoomMin;
  }

  #resetClickState() {
    this.isClicking = false;
    this.hasMovedDuringClick = false;
    this.clickOrigin = null;
  }

  init() {
    this.state.clear();

    window.addEventListener("mousedown", (e) => {
      this.isClicking = true;
      this.clickOrigin = {
        x: e.clientX,
        y: e.clientY,
      };
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isClicking) {
        return;
      }
      const dx = e.clientX - this.clickOrigin.x;
      const dy = e.clientY - this.clickOrigin.y;
      this.camX += dx / this.#scale();
      this.camY += dy / this.#scale();
      this.clickOrigin.x = e.clientX;
      this.clickOrigin.y = e.clientY;
      this.hasMovedDuringClick = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (!this.isClicking || this.hasMovedDuringClick) {
        this.#resetClickState();
        return;
      }

      this.#resetClickState();

      const x = Math.floor(
        (e.clientX - this.borders.borderLeft) / this.#zoomedInterval()
      );
      const y = Math.floor(
        (e.clientY - this.borders.borderTop) / this.#zoomedInterval()
      );
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

  update(ctx) {
    const scale = this.#scale();
    const borderLeft = this.camX - (ctx.canvas.width * scale) / 2;
    const borderRight = this.camX + (ctx.canvas.width * scale) / 2;
    const borderTop = this.camY - (ctx.canvas.height * scale) / 2;
    const borderBottom = this.camY + (ctx.canvas.height * scale) / 2;

    const leftOverX = (borderRight - borderLeft) % this.#zoomedInterval();
    const leftOverY = (borderBottom - borderTop) % this.#zoomedInterval();

    this.borders = {
      borderLeft: borderLeft + leftOverX / 2,
      borderRight: borderRight - leftOverX / 2,
      borderTop: borderTop + leftOverY / 2,
      borderBottom: borderBottom - leftOverY / 2,
    };
  }

  draw(ctx) {
    const { borderLeft, borderRight, borderTop, borderBottom } = this.borders;

    for (let i = borderLeft; i <= borderRight; i += this.#zoomedInterval()) {
      ctx.beginPath();
      ctx.moveTo(i, borderTop);
      ctx.lineTo(i, borderBottom);
      ctx.strokeStyle = this.gridBorderColor;
      ctx.stroke();
    }
    for (let i = borderTop; i <= borderBottom; i += this.#zoomedInterval()) {
      ctx.beginPath();
      ctx.moveTo(borderLeft, i);
      ctx.lineTo(borderRight, i);
      ctx.strokeStyle = this.gridBorderColor;
      ctx.stroke();
    }

    for (const key of this.state) {
      const { x, y } = this.#getCoordsFromStateKey(key);
      ctx.fillStyle = this.selectedColor;
      ctx.fillRect(
        borderLeft + x * this.#zoomedInterval(),
        borderTop + y * this.#zoomedInterval(),
        this.#zoomedInterval(),
        this.#zoomedInterval()
      );
    }
  }
}
