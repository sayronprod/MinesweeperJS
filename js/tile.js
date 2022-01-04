export default class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.status = 0;
    this.isOpened = false;
    this.isFlagged = false;
  }
}
