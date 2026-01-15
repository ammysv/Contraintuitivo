let faceMesh;
let video;
let faces = [];
let filtro = false;
let ojo = 7; // que tan cerrado el ojo
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let bien, mal;
let caraImg;

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

  if (faces.length > 0) {
    let face = faces[0];
    let keypoints = face.keypoints;

    let ojoArriba = keypoints[159];
    let ojoAbajo = keypoints[145];

    let disojo = dist(ojoArriba.x, ojoArriba.y, ojoAbajo.x, ojoAbajo.y);

    if (disojo < ojo) {
      activarFiltro();

      imageMode(CENTER);
      dibujarCara(face);

      imageMode(CORNER);
    } else {
      desactivarFiltro();
    }
  }

  if (filtro) {
    fill(255);
    textSize(18);
    text("Presiona una 'tecla' para guardar tu foto", 155, 467);
  }
}

function dibujarCara(face) {
  let k = face.keypoints;

  let izquierda = k[234];
  let derecha = k[454];
  let frente = k[10];
  let barbilla = k[152];

  let x = (izquierda.x + derecha.x) / 2;
  let y = (frente.y + barbilla.y) / 2;

  let w = dist(izquierda.x, izquierda.y, derecha.x, derecha.y);
  let h = dist(frente.x, frente.y, barbilla.x, barbilla.y);

  imageMode(CENTER);
  image(caraImg, x, y, w, h);
}

function activarFiltro() {
  if (!filtro) {
    bien.play(); // 🔊 sonido correcto
    mal.stop();
  }

  filtro = true;

  // texto para indicar que el filtro está activado
  fill(0, 255, 0);
  textSize(40);
  text("Filtro activado", 180, 445);
}

function desactivarFiltro() {
  if (filtro) {
    mal.play(); // 🔊 sonido de error
    bien.stop();
  }

  filtro = false;
  // texto para indicar que el filtro está desactivado
  fill(255, 0, 0);
  textSize(40);
  text("Activa el filtro", 180, 250);
}

function gotFaces(results) {
  faces = results;
}

function keyPressed() {
  // Solo permitir captura si el filtro está activo
  if (filtro && keyCode === ESCAPE) {
    //(key === 's' || key === 'S'))
    saveCanvas("mi_filtro_payaso", "png");
  }
}
