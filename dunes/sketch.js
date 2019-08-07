const CANVAS_WIDTH_NAME = "CanvasWidth";
const DEFAULT_CANVAS_WIDTH = 1200;
const MIN_CANVAS_WIDTH = 10;
let canvasWidth = DEFAULT_CANVAS_WIDTH;

const CANVAS_HEIGHT_NAME = "CanvasHeight";
const DEFAULT_CANVAS_HEIGHT = 800;
const MIN_CANVAS_HEIGHT = 10;
let canvasHeight = DEFAULT_CANVAS_HEIGHT;

const numWaves = 40;
const pointsPerWave = 25;
const WAVE_VARIANCE = 7;

let waveWidth = canvasWidth / (numWaves - 1);
let pointGap = canvasHeight / (pointsPerWave - 1);

/* COLOUR SCHEME GENERATORS */

function getColourDesert() {
	let r = random(180, 210);
	let g = random(r * 9 / 17, r * 10 / 17);
	let b = random(0, 30);
	return color(r, g, b);
}

function getColourMars() {
	let r = random(140, 180);
	let g = random(r * 3 / 14, r * 4 / 14);
	let b = 0;
	return color(r, g, b);
}

/* MAIN LOGIC */

class Point {
	constructor(x, y, offset=waveWidth) {
		this.x = x;
		this.y = y;
		this.offset = offset;
	}
}

function getURLParameters() {
	// Adapted from `https://www.kevinleary.net/javascript-get-url-parameters/`.
	let params = {};
	let definitions = decodeURIComponent(
		window.location.href.slice(window.location.href.indexOf("?") + 1)
	).split("&");
	definitions.forEach( function(val) {
		let parts = val.split('=', 2);
		params[parts[0]] = parts[1];
	} );
	return params;
}

function generateStandaloneWave(x) {
	let currentWave = [];
	for (let i = 0; i < pointsPerWave; ++i) {
		currentWave.push(new Point(x + random(-WAVE_VARIANCE, WAVE_VARIANCE), i * pointGap));
	}
	return currentWave;
}

function generateWave(previousWave) {
	let newWave = [];
	for (let i = 0; i < pointsPerWave; ++i) {
		let previousPoint = previousWave[i];
		let offset = previousPoint.offset + random(-WAVE_VARIANCE, WAVE_VARIANCE);
		newWave.push(new Point(previousPoint.x + offset, i * pointGap));
	}
	return newWave;
}

function generateAndDrawWaves() {
	let waves = [];
	// Generate first wave.
	waves.push(generateStandaloneWave(waveWidth / 2));
	// Generate remaining waves.
	for (let i = 1; i < numWaves; ++i) {
		waves.push(generateWave(waves[waves.length - 1]));
	}

	for (let i = waves.length - 1; i >= 0; --i) {
		let currentWave = waves[i];

		let currentColour = getColourDesert();
		fill(currentColour);
		stroke(currentColour);

		beginShape();
		vertex(0,0);
		vertex(currentWave[0].x, currentWave[0].y);
		vertex(currentWave[0].x, currentWave[0].y);
		for (let i = 1; i < currentWave.length - 1; ++i) {
			curveVertex(currentWave[i].x, currentWave[i].y);
		}
		vertex(currentWave[currentWave.length - 1].x, currentWave[currentWave.length - 1].y)
		vertex(currentWave[currentWave.length - 1].x, currentWave[currentWave.length - 1].y)
		vertex(0, canvasHeight);
		endShape(CLOSE);
	}
}

function setup() {
	let params = getURLParameters();

	canvasWidth = round(params[CANVAS_WIDTH_NAME]);
	if (isNaN(canvasWidth)) canvasWidth = DEFAULT_CANVAS_WIDTH;
	canvasWidth = constrain(canvasWidth, MIN_CANVAS_WIDTH, canvasWidth);
	let canvasWidthInput =
		document.getElementById(CANVAS_WIDTH_NAME);
	canvasWidthInput.value = canvasWidth.toString();

	canvasHeight = round(params[CANVAS_HEIGHT_NAME]);
	if (isNaN(canvasHeight)) canvasHeight = DEFAULT_CANVAS_HEIGHT;
	canvasHeight = constrain(canvasHeight, MIN_CANVAS_HEIGHT, canvasHeight);
	let canvasHeightInput =
		document.getElementById(CANVAS_HEIGHT_NAME);
	canvasHeightInput.value = canvasHeight.toString();

	let canvas = createCanvas(canvasWidth, canvasHeight);
	canvas.parent("mycanvas");
	background(getColourDesert());

	generateAndDrawWaves();
}

function mousePressed() {
	if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > canvasHeight)
		return;
	generateAndDrawWaves();
}
