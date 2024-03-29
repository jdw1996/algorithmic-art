const CANVAS_WIDTH_NAME = "CanvasWidth";
const DEFAULT_CANVAS_WIDTH = 1200;
const MIN_CANVAS_WIDTH = 10;
let canvasWidth = DEFAULT_CANVAS_WIDTH;

const CANVAS_HEIGHT_NAME = "CanvasHeight";
const DEFAULT_CANVAS_HEIGHT = 800;
const MIN_CANVAS_HEIGHT = 10;
let canvasHeight = DEFAULT_CANVAS_HEIGHT;

const NUM_WAVES_NAME = "NumWaves";
const DEFAULT_NUM_WAVES = 40;
const MIN_NUM_WAVES = 5;
const MAX_NUM_WAVES = 100;
let numWaves = DEFAULT_NUM_WAVES;

const POINTS_PER_WAVE_NAME = "PointsPerWave";
const DEFAULT_POINTS_PER_WAVE = 25;
const MIN_POINTS_PER_WAVE = 3;
const MAX_POINTS_PER_WAVE = 100;
let pointsPerWave = DEFAULT_POINTS_PER_WAVE;

const WAVE_VARIANCE_NAME = "WaveVariance";
const DEFAULT_WAVE_VARIANCE = 7;
const MIN_WAVE_VARIANCE = 0;
const MAX_WAVE_VARIANCE = 25;
let waveVariance = DEFAULT_WAVE_VARIANCE;

const COLOUR_SCHEME_NAME = "ColourScheme";
const DESERT = "Desert";
const MARS = "Mars";
const WATER = "Water";
const BEACH = "Beach";
const CANDY = "Candy";
const GREYSCALE = "Greyscale";
const DEFAULT_COLOUR_SCHEME = DESERT;
let colourScheme = DEFAULT_COLOUR_SCHEME;

const SAVE_BUTTON_NAME = "SaveButton";

let waveWidth = 0;
let pointGap = 0;

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

function getColourGreyscale() {
	let n = random(256);
	return color(n, n, n);
}

function getColourWater() {
	let b = random(200, 256);
	let r = random(0, b / 4);
	let g = random(b / 2, b * 2 / 3);
	return color(r, g, b);
}

function getColourBeach(x) {
	if (x < DEFAULT_CANVAS_WIDTH / 2) {
		return getColourDesert();
	} else {
		return getColourWater();
	}
}

function getColourCandy(x) {
	if (floor(x / waveWidth) % 2 === 0) {
		return color(random(200, 256), random(20), random(20));
	} else {
		return color(random(230,256));
	}
}

function getColour(scheme, x) {
	if (scheme === DESERT) return getColourDesert();
	if (scheme === MARS) return getColourMars();
	if (scheme === WATER) return getColourWater();
	if (scheme === BEACH) return getColourBeach(x);
	if (scheme === CANDY) return getColourCandy(x);
	else return getColourGreyscale();
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
		currentWave.push(new Point(x + random(-waveVariance, waveVariance), i * pointGap));
	}
	return currentWave;
}

function generateWave(previousWave) {
	let newWave = [];
	for (let i = 0; i < pointsPerWave; ++i) {
		let previousPoint = previousWave[i];
		let offset = previousPoint.offset + random(-waveVariance, waveVariance);
		newWave.push(new Point(previousPoint.x + offset, i * pointGap));
	}
	return newWave;
}

function generateAndDrawWaves() {
	let waves = [];
	// Generate first wave.
	waves.push(generateStandaloneWave(waveWidth / 2));
	// Generate remaining waves.
	// NB: The 10 is a fudge factor so that the waves go past the end of the canvas.
	for (let i = 1; i < numWaves + 10; ++i) {
		waves.push(generateWave(waves[waves.length - 1]));
	}

	for (let i = waves.length - 1; i >= 0; --i) {
		let currentWave = waves[i];

		let currentColour = getColour(colourScheme, currentWave[0].x);
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

	numWaves = round(params[NUM_WAVES_NAME]);
	if (isNaN(numWaves)) numWaves = DEFAULT_NUM_WAVES;
	numWaves = constrain(numWaves, MIN_NUM_WAVES, MAX_NUM_WAVES);
	let numWavesInput =
		document.getElementById(NUM_WAVES_NAME);
	numWavesInput.value = numWaves.toString();

	pointsPerWave = round(params[POINTS_PER_WAVE_NAME]);
	if (isNaN(pointsPerWave)) pointsPerWave = DEFAULT_POINTS_PER_WAVE;
	pointsPerWave = constrain(pointsPerWave, MIN_POINTS_PER_WAVE, MAX_POINTS_PER_WAVE);
	let pointsPerWaveInput =
		document.getElementById(POINTS_PER_WAVE_NAME);
	pointsPerWaveInput.value = pointsPerWave.toString();

	waveVariance = round(params[WAVE_VARIANCE_NAME]);
	if (isNaN(waveVariance)) waveVariance = DEFAULT_WAVE_VARIANCE;
	waveVariance = constrain(waveVariance, MIN_WAVE_VARIANCE, MAX_WAVE_VARIANCE);
	let waveVarianceInput =
		document.getElementById(WAVE_VARIANCE_NAME);
	waveVarianceInput.value = waveVariance.toString();

	colourScheme = COLOUR_SCHEME_NAME in params
		? params[COLOUR_SCHEME_NAME]
		: DEFAULT_COLOUR_SCHEME;
	document.getElementById(COLOUR_SCHEME_NAME).value = colourScheme;

	let canvas = createCanvas(canvasWidth, canvasHeight);
	canvas.parent("mycanvas");
	background(getColour(colourScheme, DEFAULT_CANVAS_WIDTH));

	document.getElementById(SAVE_BUTTON_NAME).onclick = saveCanvas;

	waveWidth = canvasWidth / (numWaves - 1);
	pointGap = canvasHeight / (pointsPerWave - 1);

	generateAndDrawWaves();
}

function mousePressed() {
	if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > canvasHeight)
		return;
	generateAndDrawWaves();
}
