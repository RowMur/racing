const LOCAL_STORAGE_KEY = "editorState";
class Editor {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.interval = 80;
    this.gridBorderColor = "lightgrey";
    this.selectedColor = "lightgrey";

    this.state = new Map();
    this.start = null;

    this.lastAdded = null;
    this.lastRemoved = null;
    this.isHoldingShift = false;

    this.zoom = 1;
    this.zoomMax = 2;
    this.zoomMin = 0.5;
    this.zoomStep = 0.1;

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

  #getState(x, y) {
    const key = this.#stateKeyFromCoords(x, y);
    return this.state.get(key);
  }

  #setState(x, y, value) {
    const key = this.#stateKeyFromCoords(x, y);
    if (!value) {
      if (this.start === key) {
        this.start = null;
      }

      this.state.delete(key);
      this.lastAdded = null;
      this.lastRemoved = key;
      return;
    }

    if (this.state.has(key)) {
      return;
    }

    if (!this.start) {
      this.start = key;
    }

    let thisTilesTo = null;
    let thisTilesFrom = null;

    const upNeighbor = this.#getState(x, y - 1);
    const downNeighbor = this.#getState(x, y + 1);
    const leftNeighbor = this.#getState(x - 1, y);
    const rightNeighbor = this.#getState(x + 1, y);

    while (true) {
      const addDirection = (direction) => {
        if (!thisTilesFrom) {
          thisTilesFrom = direction;
          return false;
        }
        if (!thisTilesTo) {
          thisTilesTo = direction;
          return true;
        }

        return true;
      };

      // First check if any are poiting at this tile
      if (
        upNeighbor &&
        (upNeighbor.to === "DOWN" || upNeighbor.from === "DOWN")
      ) {
        const haveFilledDirections = addDirection("UP");
        if (haveFilledDirections) {
          break;
        }
      }
      if (
        downNeighbor &&
        (downNeighbor.to === "UP" || downNeighbor.from === "UP")
      ) {
        const haveFilledDirections = addDirection("DOWN");
        if (haveFilledDirections) {
          break;
        }
      }
      if (
        leftNeighbor &&
        (leftNeighbor.to === "RIGHT" || leftNeighbor.from === "RIGHT")
      ) {
        const haveFilledDirections = addDirection("LEFT");
        if (haveFilledDirections) {
          break;
        }
      }
      if (
        rightNeighbor &&
        (rightNeighbor.to === "LEFT" || rightNeighbor.from === "LEFT")
      ) {
        const haveFilledDirections = addDirection("RIGHT");
        if (haveFilledDirections) {
          break;
        }
      }

      // Then check for any neighbors that aren't pointing at another tile
      if (upNeighbor) {
        const upLeftNeighborKey = this.#stateKeyFromCoords(x - 1, y - 1);
        const upRightNeighborKey = this.#stateKeyFromCoords(x + 1, y - 1);
        const upUpNeighborKey = this.#stateKeyFromCoords(x, y - 2);
        const upLeftNeighbor = this.state.get(upLeftNeighborKey);
        const upRightNeighbor = this.state.get(upRightNeighborKey);
        const upUpNeighbor = this.state.get(upUpNeighborKey);

        const upToNeighbor =
          upNeighbor.to === "UP"
            ? upUpNeighbor
            : upNeighbor.to === "LEFT"
            ? upLeftNeighbor
            : upNeighbor.to === "RIGHT"
            ? upRightNeighbor
            : null;

        const upFromNeighbor =
          upNeighbor.from === "UP"
            ? upUpNeighbor
            : upNeighbor.from === "LEFT"
            ? upLeftNeighbor
            : upNeighbor.from === "RIGHT"
            ? upRightNeighbor
            : null;

        if (!upToNeighbor && upNeighbor.to !== "DOWN") {
          upNeighbor.updateDirections(null, "DOWN");
          const haveFilledDirections = addDirection("UP");
          if (haveFilledDirections) {
            break;
          }
        } else if (!upFromNeighbor && upNeighbor.from !== "DOWN") {
          upNeighbor.updateDirections("DOWN", null);
          const haveFilledDirections = addDirection("UP");
          if (haveFilledDirections) {
            break;
          }
        }
      }

      if (downNeighbor) {
        const downLeftNeighborKey = this.#stateKeyFromCoords(x - 1, y + 1);
        const downRightNeighborKey = this.#stateKeyFromCoords(x + 1, y + 1);
        const downDownNeighborKey = this.#stateKeyFromCoords(x, y + 2);
        const downLeftNeighbor = this.state.get(downLeftNeighborKey);
        const downRightNeighbor = this.state.get(downRightNeighborKey);
        const downDownNeighbor = this.state.get(downDownNeighborKey);

        const downToNeighbor =
          downNeighbor.to === "DOWN"
            ? downDownNeighbor
            : downNeighbor.to === "LEFT"
            ? downLeftNeighbor
            : downNeighbor.to === "RIGHT"
            ? downRightNeighbor
            : null;

        const downFromNeighbor =
          downNeighbor.from === "DOWN"
            ? downDownNeighbor
            : downNeighbor.from === "LEFT"
            ? downLeftNeighbor
            : downNeighbor.from === "RIGHT"
            ? downRightNeighbor
            : null;

        if (!downToNeighbor && downNeighbor.to !== "UP") {
          downNeighbor.updateDirections(null, "UP");
          const haveFilledDirections = addDirection("DOWN");
          if (haveFilledDirections) {
            break;
          }
        } else if (!downFromNeighbor && downNeighbor.from !== "UP") {
          downNeighbor.updateDirections("UP", null);
          const haveFilledDirections = addDirection("DOWN");
          if (haveFilledDirections) {
            break;
          }
        }
      }

      if (leftNeighbor) {
        const leftUpNeighborKey = this.#stateKeyFromCoords(x - 1, y - 1);
        const leftDownNeighborKey = this.#stateKeyFromCoords(x - 1, y + 1);
        const leftLeftNeighborKey = this.#stateKeyFromCoords(x - 2, y);
        const leftUpNeighbor = this.state.get(leftUpNeighborKey);
        const leftDownNeighbor = this.state.get(leftDownNeighborKey);
        const leftLeftNeighbor = this.state.get(leftLeftNeighborKey);

        const leftToNeighbor =
          leftNeighbor.to === "LEFT"
            ? leftLeftNeighbor
            : leftNeighbor.to === "UP"
            ? leftUpNeighbor
            : leftNeighbor.to === "DOWN"
            ? leftDownNeighbor
            : null;

        const leftFromNeighbor =
          leftNeighbor.from === "LEFT"
            ? leftLeftNeighbor
            : leftNeighbor.from === "UP"
            ? leftUpNeighbor
            : leftNeighbor.from === "DOWN"
            ? leftDownNeighbor
            : null;

        if (!leftToNeighbor && leftNeighbor.to !== "RIGHT") {
          leftNeighbor.updateDirections(null, "RIGHT");
          const haveFilledDirections = addDirection("LEFT");
          if (haveFilledDirections) {
            break;
          }
        } else if (!leftFromNeighbor && leftNeighbor.from !== "RIGHT") {
          leftNeighbor.updateDirections("RIGHT", null);
          const haveFilledDirections = addDirection("LEFT");
          if (haveFilledDirections) {
            break;
          }
        }
      }

      if (rightNeighbor) {
        const rightUpNeighborKey = this.#stateKeyFromCoords(x + 1, y - 1);
        const rightDownNeighborKey = this.#stateKeyFromCoords(x + 1, y + 1);
        const rightRightNeighborKey = this.#stateKeyFromCoords(x + 2, y);
        const rightUpNeighbor = this.state.get(rightUpNeighborKey);
        const rightDownNeighbor = this.state.get(rightDownNeighborKey);
        const rightRightNeighbor = this.state.get(rightRightNeighborKey);

        const rightToNeighbor =
          rightNeighbor.to === "RIGHT"
            ? rightRightNeighbor
            : rightNeighbor.to === "UP"
            ? rightUpNeighbor
            : rightNeighbor.to === "DOWN"
            ? rightDownNeighbor
            : null;

        const rightFromNeighbor =
          rightNeighbor.from === "RIGHT"
            ? rightRightNeighbor
            : rightNeighbor.from === "UP"
            ? rightUpNeighbor
            : rightNeighbor.from === "DOWN"
            ? rightDownNeighbor
            : null;

        if (!rightToNeighbor && rightNeighbor.to !== "LEFT") {
          rightNeighbor.updateDirections(null, "LEFT");
          const haveFilledDirections = addDirection("RIGHT");
          if (haveFilledDirections) {
            break;
          }
        } else if (!rightFromNeighbor && rightNeighbor.from !== "LEFT") {
          rightNeighbor.updateDirections("LEFT", null);
          const haveFilledDirections = addDirection("RIGHT");
          if (haveFilledDirections) {
            break;
          }
        }
      }
      break;
    }

    this.state.set(key, new Tile(x, y, thisTilesFrom, thisTilesTo));
    this.lastAdded = key;
    this.lastRemoved = null;
  }

  #getCanvasCoordsFromStateCoords(x, y) {
    return {
      x: this.x + x * this.#zoomedInterval(),
      y: this.y + y * this.#zoomedInterval(),
    };
  }

  #resetClickState() {
    this.isClicking = false;
    this.hasMovedDuringClick = false;
    this.clickOrigin = null;
  }

  init(ctx) {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      this.start = parsedState.start;
      for (const { key, tile } of parsedState.tiles) {
        this.state.set(key, new Tile(tile.x, tile.y, tile.from, tile.to));
      }
    }

    window.addEventListener("mousedown", (e) => {
      if (e.target !== ctx.canvas) return;
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
      this.x += dx;
      this.y += dy;
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

      const x = Math.floor((e.clientX - this.x) / this.#zoomedInterval());
      const y = Math.floor((e.clientY - this.y) / this.#zoomedInterval());
      this.#setState(x, y, !this.#getState(x, y));
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
    const offsetX = this.#zoomedInterval() - (this.x % this.#zoomedInterval());
    const offsetY = this.#zoomedInterval() - (this.y % this.#zoomedInterval());
    const borderLeft = -offsetX;
    let borderRight;
    for (
      let i = borderLeft;
      i <= ctx.canvas.width;
      i += this.#zoomedInterval()
    ) {
      borderRight = i;
    }
    borderRight += this.#zoomedInterval();
    const borderTop = -offsetY;
    let borderBottom;
    for (
      let i = borderTop;
      i <= ctx.canvas.height;
      i += this.#zoomedInterval()
    ) {
      borderBottom = i;
    }
    borderBottom += this.#zoomedInterval();

    this.borders = {
      borderLeft: borderLeft,
      borderRight: borderRight,
      borderTop: borderTop,
      borderBottom: borderBottom,
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

    for (const [key, tile] of this.state.entries()) {
      const { x, y } = this.#getCanvasCoordsFromStateCoords(tile.x, tile.y);
      tile.draw(ctx, x, y, this.#zoomedInterval(), key === this.start);
    }
  }

  save() {
    const state = {
      start: this.start,
      tiles: Array.from(this.state.entries()).map(([key, tile]) => ({
        key,
        tile,
      })),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
}
