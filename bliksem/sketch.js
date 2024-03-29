const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
let GRADIENT_ARRAY = [
	[20, 0.1], [12, 0.2], [7, 0.3], [5, 0.4], [4, 0.6], [3, 0.8], [1, 1]
];

let lightningColour = null;
let backgroundColour = null;
let automaticBoltsCheckbox = null;

class Bolt {
	constructor(initialAngle, initialRadius, isRoot, momentum=0) {
		this.points = [];
		this.points.push([initialAngle, initialRadius]);
		this.isRoot = isRoot;
		this.momentum = momentum;
		this.numBranches = 0;
	}

	get lastPoint() {
		return this.points[this.points.length - 1];
	}

	addPoint(angle, radius) {
		this.points.push([angle, radius]);
		if (this.points.length >= 2) {
			this.momentum = constrain(
				this.points[this.points.length - 1][0]
				- this.points[this.points.length - 2][0],
				-0.05,
				0.05
			);
		}
	}
}

function generateBolt(initialAngle, initialRadius, isRoot, momentum=0) {
	let newBolt = new Bolt(initialAngle, initialRadius, isRoot, momentum);
	let bolts = [];
	while (
		newBolt.lastPoint[1]
		< max(CANVAS_HEIGHT, CANVAS_WIDTH) / 2
	) {
		let newAngle =
			newBolt.lastPoint[0]
			+ random(newBolt.momentum - 0.1, newBolt.momentum + 0.1);
		let newRadius = newBolt.lastPoint[1] + 10;
		newBolt.addPoint(newAngle, newRadius);
		if (
			newBolt.numBranches < newBolt.points.length / 16 && random() < 0.06
		) {
			bolts = bolts.concat(
				generateBolt(newAngle, newRadius, false, -newBolt.momentum)
			);
			newBolt.numBranches += 1;
		}
		if (!isRoot && random() < 0.07) break;
	}
	bolts.push(newBolt);
	return bolts;
}

function drawBolts(centreX, centreY, numBolts) {
	let bolts = [];
	for (let i = 0; i < random(1,4); ++i) {
		bolts = bolts.concat(generateBolt(random(0, 2 * PI), 0, true, 0));
	}
	for (let j = 0; j < GRADIENT_ARRAY.length; ++j) {
		for (let k = 0; k < bolts.length; ++k) {
			let currentBolt = bolts[k];
			for (let i = 0; i < currentBolt.points.length - 1; ++i) {
				strokeWeight(GRADIENT_ARRAY[j][0]);
				stroke(lerpColor(
					backgroundColour, lightningColour, GRADIENT_ARRAY[j][1]
				));
				line(
					cos(currentBolt.points[i][0]) * currentBolt.points[i][1]
					+ centreX,
					sin(currentBolt.points[i][0]) * currentBolt.points[i][1]
					+ centreY,
					cos(currentBolt.points[i+1][0]) * currentBolt.points[i+1][1]
					+ centreX,
					sin(currentBolt.points[i+1][0]) * currentBolt.points[i+1][1]
					+ centreY
				);
			}
		}
	}
}

function fade() {
	stroke(fadeColour);
	fill(fadeColour);
	rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function setup() {
	colorMode(RGB, 255, 255, 255, 1);
	lightningColour = color(255);
	backgroundColour = color(77, 0, 102);
	fadeColour = color(
		red(backgroundColour),
		green(backgroundColour),
		blue(backgroundColour),
		0.5
	);
	automaticBoltsCheckbox = document.getElementById("automaticBolts");

	let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	canvas.parent("mycanvas");
	background(backgroundColour);

	frameRate(1);

	drawBolts(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 5)
}

function draw() {
	if (!automaticBoltsCheckbox.checked) return;
	fade();
	drawBolts(
		random(100, CANVAS_WIDTH - 100),
		random(100, CANVAS_HEIGHT - 100),
		random(1,4)
	);
}

function mousePressed() {
	if (automaticBoltsCheckbox.checked) return;
	fade();
	drawBolts(mouseX, mouseY, random(1,4));
}
