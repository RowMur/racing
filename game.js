const SCREEN_EDITOR = "screen_editor";
const SCREEN_RACE = "screen_race";

class Game {
  #editButton;
  #raceButton;
  #saveButton;

  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.screen = SCREEN_EDITOR;
    this.storage = new Storage();

    this.#editButton = document.getElementById("edit");
    this.#raceButton = document.getElementById("race");
    this.#saveButton = document.getElementById("save");
  }

  init() {
    this.#editButton.addEventListener("click", () => {
      this.screen = SCREEN_EDITOR;
    });
    this.#raceButton.addEventListener("click", () => {
      this.editor.save();
      this.screen = SCREEN_RACE;
    });
    this.#saveButton.addEventListener("click", () => {
      this.editor.save();
    });
  }

  draw(ctx) {
    if (this.screen === SCREEN_EDITOR) {
      this.editor.draw(ctx);
    } else if (this.screen === SCREEN_RACE) {
      this.race.draw(ctx);
    }
  }

  update(ctx) {
    if (this.screen === SCREEN_EDITOR) {
      if (!this.editor) {
        this.editor = new Editor(this.x, this.y, this.storage);
        this.editor.init(ctx);
      }
      this.race = undefined;
      this.#editButton.style.display = "none";
      this.#raceButton.style.display = "block";
      this.#saveButton.style.display = "block";
      this.editor.update(ctx);
    } else if (this.screen === SCREEN_RACE) {
      if (!this.race) {
        this.race = new Race(this.x, this.y);
      }
      this.editor = undefined;
      this.#editButton.style.display = "block";
      this.#saveButton.style.display = "none";
      this.#raceButton.style.display = "none";
    }
  }
}
