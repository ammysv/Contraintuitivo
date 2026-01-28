let faceMesh;
let video;
let faces = [];
let filtro = false;
let ojo = 7;
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

let bien, mal;
let caraImg;

let sx = 0,
  sy = 0;
let alphaFiltro = 0;
let mensajeGuardado = 0;

function preload() {
  faceMesh = ml5.faceMesh(options);
  mal = loadSound("incorrecto.mp3");
  bien = loadSound("correcto.mp3");
  caraImg = loadImage("cara.png");
}

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
  userStartAudio();
}

function draw() {
  imageMode(CORNER);
  image(video, 0, 0, width, height);

  // Marco
  noFill();
  stroke(255, 120);
  strokeWeight(3);
  rect(8, 8, width - 16, height - 16, 20);

  if (faces.length > 0) {
    let face = faces[0];
    let k = face.keypoints;

    let ojoArriba = k[159];
    let ojoAbajo = k[145];
    let disojo = dist(ojoArriba.x, ojoArriba.y, ojoAbajo.x, ojoAbajo.y);

    if (disojo < ojo) {
      activarFiltro();
      alphaFiltro = lerp(alphaFiltro, 255, 0.08);

      imageMode(CENTER);
      dibujarCara(face);
      imageMode(CORNER);
    } else {
      desactivarFiltro();
      alphaFiltro = lerp(alphaFiltro, 0, 0.1);
    }
  }

  dibujarUI();
}

function dibujarCara(face) {
  let k = face.keypoints;

  let izquierda = k[234];
  let derecha = k[454];
  let frente = k[10];
  let barbilla = k[152];

  let x = (izquierda.x + derecha.x) / 2;
  let y = (frente.y + barbilla.y) / 2;

  sx = lerp(sx, x, 0.3);
  sy = lerp(sy, y, 0.3);

  let w = dist(izquierda.x, izquierda.y, derecha.x, derecha.y);
  let h = dist(frente.x, frente.y, barbilla.x, barbilla.y);

  let ojoIzq = k[33];
  let ojoDer = k[263];
  let angulo = atan2(ojoDer.y - ojoIzq.y, ojoDer.x - ojoIzq.x);

  push();
  translate(sx, sy);
  rotate(angulo);

  noStroke();
  fill(255, 80);
  ellipse(0, 0, w * 1.1, h * 1.1);

  tint(255, alphaFiltro);
  image(caraImg, 0, 0, w, h);
  noTint();

  pop();
}

function activarFiltro() {
  if (!filtro) {
    bien.play();
    mal.stop();
  }
  filtro = true;
}

function desactivarFiltro() {
  if (filtro) {
    mal.play();
    bien.stop();
  }
  filtro = false;
}

function dibujarUI() {
  noStroke();
  fill(0, 160);
  rect(0, height - 40, width, 40);

  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);

  if (filtro) {
    text(
      "Filtro activo · Presiona una TECLA para guardar",
      width / 2,
      height - 20,
    );
  } else {
    text("Haz algo para activar el filtro", width / 2, height - 20);
  }
  if (mensajeGuardado > 0) {
    fill(0, 255, 160);
    text("✔ Foto guardada", width / 2, 30);
    mensajeGuardado--;
  }
}

function gotFaces(results) {
  faces = results;
}

function keyPressed() {
  if (filtro && keyCode === ESCAPE) {
    saveCanvas("mi_filtro_payaso", "png");
    mensajeGuardado = 60;
  }
}
