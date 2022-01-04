import Tile from "./tile.js";
export class Game {
  #settings = [{ rows: 9, columns: 9, mines: 10 }];
  #tiles = [];
  #lastOpened = null;
  #onMouseDownHandler = this.#onMouseDown.bind(this);
  #onMouseUpHandler = this.#onMouseUp.bind(this);
  #onMouseMoveHandler = this.#onMouseMove.bind(this);
  #onMouseRightClickHandler = this.#onRightClick.bind(this);
  #onMouseUpDocumentHandler = this.#onMouseUpDocument.bind(this);
  #canvas;
  #context;
  #level;
  #images;
  #tileSize;
  #openCount;

  constructor(canvas, level, images) {
    this.#canvas = canvas;
    this.#context = canvas.getContext("2d");
    this.#context.shadowBlur = 0;
    this.#context.imageSmoothingEnabled = false;
    this.#context.mozImageSmoothingEnabled = false;
    this.#context.webkitImageSmoothingEnabled = false;
    this.#context.msImageSmoothingEnabled = false;
    this.#level = level;
    this.#images = images;
    this.#tileSize = 30;
    this.#openCount = 0;

    this.#addListeners();
  }

  #addListeners() {
    this.#canvas.addEventListener("mousedown", this.#onMouseDownHandler, false);

    this.#canvas.addEventListener("mouseup", this.#onMouseUpHandler, false);

    this.#canvas.addEventListener("mousemove", this.#onMouseMoveHandler, false);

    this.#canvas.addEventListener(
      "contextmenu",
      this.#onMouseRightClickHandler,
      false
    );

    document.addEventListener("mouseup", this.#onMouseUpDocumentHandler, false);
  }

  #removeListeners() {
    this.#canvas.removeEventListener(
      "mousedown",
      this.#onMouseDownHandler,
      false
    );

    this.#canvas.removeEventListener("mouseup", this.#onMouseUpHandler, false);

    this.#canvas.removeEventListener(
      "mousemove",
      this.#onMouseMoveHandler,
      false
    );

    this.#canvas.removeEventListener(
      "contextmenu",
      this.#onMouseRightClickHandler,
      false
    );

    document.removeEventListener(
      "mouseup",
      this.#onMouseUpDocumentHandler,
      false
    );
  }

  async start() {
    this.#drawBoard();
    this.#createMines();
    this.#createGlobalMap();
  }

  #drawBoard() {
    this.#setArenaSize(
      this.#settings[this.#level].rows * this.#tileSize,
      this.#settings[this.#level].columns * this.#tileSize
    );

    let x = 0;
    let y = 0;
    for (let i = 0; i < this.#settings[this.#level].rows; i++) {
      this.#tiles.push([]);
      for (let j = 0; j < this.#settings[this.#level].columns; j++) {
        this.#context.drawImage(
          this.#images[12],
          x,
          y,
          this.#tileSize,
          this.#tileSize
        );
        this.#tiles[i].push(new Tile(y, x));
        x += this.#tileSize;
      }
      x = 0;
      y += this.#tileSize;
    }
  }

  #createGlobalMap() {
    for (let i = 0; i < this.#settings[this.#level].rows; i++) {
      for (let j = 0; j < this.#settings[this.#level].columns; j++) {
        if (this.#tiles[i][j].status === 10) {
          continue;
        }
        let mines = 0;
        for (let k = -1; k < 2; k++) {
          for (let l = -1; l < 2; l++) {
            let posI = i + k;
            let posJ = j + l;
            if (
              this.#isInArea(posI, posJ) &&
              this.#tiles[posI][posJ].status === 10
            ) {
              mines++;
            }
          }
        }
        this.#tiles[i][j].status = mines;
      }
    }
  }

  #createMines() {
    for (let i = 0; i < this.#settings[this.#level].mines; i++) {
      let xCoord, yCoord;
      do {
        xCoord = this.#getRandomNumber(0, this.#settings[this.#level].rows);
        yCoord = this.#getRandomNumber(0, this.#settings[this.#level].columns);
      } while (
        this.#tiles[xCoord][yCoord].status == 10 ||
        this.#isAngle(xCoord, yCoord)
      );
      this.#tiles[xCoord][yCoord].status = 10;
    }
  }

  #onRightClick(event) {
    //забираем контекстное меню при правом клике на канвасе
    event.preventDefault();
  }

  #onMouseUpDocument(event) {
    if (!this.#isInCanvasRect(event) && this.#lastOpened != null) {
      this.#closelastOpenedCell();
    }
  }

  #onMouseMove(event) {
    if (!this.#isInCanvasRect(event)) {
      return;
    }

    if (this.#isRightMouse(event)) {
      return;
    }

    if (this.#isLeftMouse(event)) {
      let x = Math.floor(event.offsetX / this.#tileSize);
      let y = Math.floor(event.offsetY / this.#tileSize);
      if (
        this.#lastOpened != null &&
        !this.#tiles[this.#lastOpened.x][this.#lastOpened.y].isOpened
      ) {
        this.#closelastOpenedCell();
      }
      if (this.#isCanBePreopen(x, y)) {
        this.#preOpenCell(x, y);
        this.#lastOpened = { x, y };
      }
    }
  }

  #onMouseDown(event) {
    let x = Math.floor(event.offsetX / this.#tileSize);
    let y = Math.floor(event.offsetY / this.#tileSize);

    if (this.#isRightMouse(event)) {
      if (this.#tiles[x][y].isFlagged) {
        this.#unflagCell(x, y);
      } else {
        if (!this.#tiles[x][y].isOpened) {
          this.#flagCell(x, y);
        }
      }
    } else {
      if (this.#isCanBePreopen(x, y)) {
        this.#preOpenCell(x, y);
        this.#lastOpened = { x, y };
      }
    }
  }

  #onMouseUp(event) {
    if (this.#isRightMouse(event)) {
      return;
    }

    let x = Math.floor(event.offsetX / this.#tileSize);
    let y = Math.floor(event.offsetY / this.#tileSize);
    if (this.#isCanBePreopen(x, y)) {
      this.#openCell(x, y);
    }
    this.#lastOpened = null;
  }

  #drawCell(x, y, image) {
    this.#context.drawImage(
      this.#images[image],
      this.#tiles[x][y].x,
      this.#tiles[x][y].y,
      this.#tileSize,
      this.#tileSize
    );
  }

  #flagCell(x, y) {
    this.#tiles[x][y].isFlagged = true;
    this.#drawCell(x, y, 13);
  }

  #unflagCell(x, y) {
    this.#tiles[x][y].isFlagged = false;
    this.#drawCell(x, y, 12);
  }

  #closelastOpenedCell() {
    this.#drawCell(this.#lastOpened.x, this.#lastOpened.y, 12);
    this.#lastOpened = null;
  }

  #preOpenCell(x, y) {
    this.#drawCell(x, y, 0);
  }

  #openAll() {
    for (let i = 0; i < this.#settings[this.#level].rows; i++) {
      for (let j = 0; j < this.#settings[this.#level].columns; j++) {
        if (!this.#tiles[i][j].isOpened) {
          this.#drawCell(i, j, this.#tiles[i][j].status);
        }
      }
    }
  }

  #openCell(x, y) {
    if (this.#tiles[x][y].status === 10) {
      this.#tiles[x][y].isOpened = true;
      this.#tiles[x][y].status = 11;
      this.#drawCell(x, y, this.#tiles[x][y].status);
      this.#openAll();
      this.#removeListeners();
      setTimeout(() => alert("You lose!"), 0);
    }

    if (this.#tiles[x][y].status !== 0) {
      this.#tiles[x][y].isOpened = true;
      this.#openCount++;
      this.#drawCell(x, y, this.#tiles[x][y].status);
    } else {
      for (let k = -1; k < 2; k++) {
        for (let l = -1; l < 2; l++) {
          let posX = x + k;
          let posY = y + l;
          if (
            this.#isInArea(posX, posY) &&
            this.#tiles[posX][posY].status !== 10 &&
            !this.#tiles[posX][posY].isOpened
          ) {
            this.#tiles[posX][posY].isOpened = true;
            this.#openCount++;
            this.#drawCell(posX, posY, this.#tiles[posX][posY].status);
            if (this.#tiles[posX][posY].status === 0) {
              this.#openCell(posX, posY);
            }
          }
        }
      }
    }
    this.#checkWin();
  }

  #checkWin() {
    let totalCell =
      this.#settings[this.#level].rows * this.#settings[this.#level].columns;
    console.log(this.#openCount);
    if (this.#openCount === totalCell - this.#settings[this.#level].mines) {
      this.#removeListeners();
      setTimeout(() => alert("You win!"), 0);
    }
  }

  #setArenaSize(width, height) {
    this.#canvas.setAttribute("width", width);
    this.#canvas.setAttribute("height", height);
  }

  #getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  #isInArea(x, y) {
    let result = true;
    if (
      x < 0 ||
      x >= this.#settings[this.#level].rows ||
      y < 0 ||
      y >= this.#settings[this.#level].columns
    ) {
      result = false;
    }
    return result;
  }

  #isAngle(x, y) {
    let result = false;
    if (x === 0 && y === 0) {
      result = true;
    } else if (x === 0 && y === this.#settings[this.#level].columns - 1) {
      result = true;
    } else if (x == this.#settings[this.#level].rows - 1 && y == 0) {
      result = true;
    } else if (
      x == this.#settings[this.#level].rows - 1 &&
      y === this.#settings[this.#level].columns - 1
    ) {
      result = true;
    }
    return result;
  }

  #isInCanvasRect(event) {
    let result = true;
    if (
      event.offsetX < 0 ||
      event.offsetY < 0 ||
      event.offsetX >= this.#settings[this.#level].rows * this.#tileSize ||
      event.offsetY >= this.#settings[this.#level].columns * this.#tileSize
    ) {
      result = false;
    }
    return result;
  }

  #isCanBePreopen(x, y) {
    return !this.#tiles[x][y].isOpened && !this.#tiles[x][y].isFlagged;
  }

  #isLeftMouse(event) {
    return (
      (event.which && event.which == 1) || (event.button && event.button == 1)
    );
  }

  #isRightMouse(event) {
    return (
      (event.which && event.which == 3) || (event.button && event.button == 2)
    );
  }
}
