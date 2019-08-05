const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const NUM_WAVES = 26;
const POINTS_PER_WAVE = 25;
const WAVE_VARIANCE = 7;

const WAVE_WIDTH = CANVAS_WIDTH / (NUM_WAVES - 1);
const POINT_GAP = CANVAS_HEIGHT / (POINTS_PER_WAVE - 1);

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

/* COLOUR SCHEME GENERATORS */

function getColorDesert() {
	let red = random(170, 200);
	let green = random(red / 2, red * 3 / 5);
	let blue = random(0, 30);
	return color(red, green, blue)
}

function getColorMars() {
	let red = random(110, 150);
	let green = random(0, red / 4);
	let blue = 0;
	return color(red, green, blue);
}

/* MAIN LOGIC */

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
		newWave.push(new Point(previousPoint.x + WAVE_WIDTH + random(-WAVE_VARIANCE, WAVE_VARIANCE), i * POINT_GAP));
	}
	return newWave;
}

function setup() {
	let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	canvas.parent("mycanvas");
	background(getColorDesert());

	let waves = [];
	// Generate first wave.
	waves.push(generateStandaloneWave(WAVE_WIDTH / 2));
	// Generate remaining waves.
	for (let i = 1; i < NUM_WAVES; ++i) {
		waves.push(generateWave(waves[waves.length - 1]));
	}

	for (let i = waves.length - 1; i >= 0; --i) {
		let currentWave = waves[i];

		let currentColour = getColorDesert();
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
