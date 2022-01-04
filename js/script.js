import { Game } from "./game.js";

var canvas = document.getElementById("canvas");
var game;
var spriteNames = [
  "0.png",
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "badFlagged.png",
  "bomb.png",
  "boom.png",
  "facingDown.png",
  "flagged.png",
];
var images = [];
await onLoad();

async function onLoad() {
  await loadImages();
  game = new Game(canvas, 0, images);
  game.start();
}
async function loadImages() {
  for (const spriteName of spriteNames) {
    let img = new Image();
    img.src = `./resources/${spriteName}`;
    await img.decode();
    images.push(img);
  }
}
