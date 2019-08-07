const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const NUM_WAVES = 40;
const POINTS_PER_WAVE = 25;
const WAVE_VARIANCE = 7;

const WAVE_WIDTH = CANVAS_WIDTH / (NUM_WAVES - 1);
const POINT_GAP = CANVAS_HEIGHT / (POINTS_PER_WAVE - 1);

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
	constructor(x, y, offset=WAVE_WIDTH) {
		this.x = x;
		this.y = y;
		this.offset = offset;
	}
}

function generateStandaloneWave(x) {
	let currentWave = [];
	for (let i = 0; i < POINTS_PER_WAVE; ++i) {
		currentWave.push(new Point(x + random(-WAVE_VARIANCE, WAVE_VARIANCE), i * POINT_GAP));
	}
	return currentWave;
}

function generateWave(previousWave) {
	let newWave = [];
	for (let i = 0; i < POINTS_PER_WAVE; ++i) {
		let previousPoint = previousWave[i];
		let offset = previousPoint.offset + random(-WAVE_VARIANCE, WAVE_VARIANCE);
		newWave.push(new Point(previousPoint.x + offset, i * POINT_GAP));
	}
	return newWave;
}

function setup() {
	let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	canvas.parent("mycanvas");
	background(getColourDesert());

	let waves = [];
	// Generate first wave.
	waves.push(generateStandaloneWave(WAVE_WIDTH / 2));
	// Generate remaining waves.
	for (let i = 1; i < NUM_WAVES; ++i) {
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
		vertex(0, CANVAS_HEIGHT);
		endShape(CLOSE);
	}
}
