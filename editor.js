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

    if (this.start === null) {
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

  #scale() {
    return this.zoom / this.zoomMin;
  }

  #getCanvasCoordsFromStateCoords(x, y) {
    const { borderLeft, borderTop } = this.borders;
    return {
      x: borderLeft + x * this.#zoomedInterval(),
      y: borderTop + y * this.#zoomedInterval(),
    };
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

      if (
        e.clientX < this.borders.borderLeft ||
        e.clientX > this.borders.borderRight ||
        e.clientY < this.borders.borderTop ||
        e.clientY > this.borders.borderBottom
      ) {
        return;
      }

      const x = Math.floor(
        (e.clientX - this.borders.borderLeft) / this.#zoomedInterval()
      );
      const y = Math.floor(
        (e.clientY - this.borders.borderTop) / this.#zoomedInterval()
      );
      // if (!this.isHoldingShift) {
      this.#setState(x, y, !this.#getState(x, y));
      // return;
      // }

      // if (this.lastAdded === null && this.lastRemoved === null) {
      //   return;
      // }

      // const isAdding = !!this.lastAdded;
      // const lastKey = isAdding ? this.lastAdded : this.lastRemoved;

      // const { x: lastX, y: lastY } = this.#getCoordsFromStateKey(lastKey);
      // const minX = Math.min(x, lastX);
      // const maxX = Math.max(x, lastX);
      // const minY = Math.min(y, lastY);
      // const maxY = Math.max(y, lastY);
      // for (let i = minX; i <= maxX; i++) {
      //   for (let j = minY; j <= maxY; j++) {
      //     this.#setState(i, j, isAdding);
      //   }
      // }
      // this.lastAdded = this.#stateKeyFromCoords(x, y);
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

    for (const [key, tile] of this.state.entries()) {
      const { x, y } = this.#getCanvasCoordsFromStateCoords(tile.x, tile.y);
      tile.draw(ctx, x, y, this.#zoomedInterval(), key === this.start);
    }
  }
}
