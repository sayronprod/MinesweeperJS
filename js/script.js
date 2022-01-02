var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var standartTile = document.getElementById("standartTile");
var tileSize = 25;
onLoad();

function onLoad() {
  setArenaSize(225, 225);
  let x = 0;
  let y = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      context.drawImage(standartTile, x, y, 25, 25);
      x += tileSize;
    }
    x = 0;
    y += tileSize;
  }
}

function setArenaSize(width, height) {
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
}
