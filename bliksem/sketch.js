const DEFAULT_CANVAS_WIDTH = 1200;
const DEFAULT_CANVAS_HEIGHT = 800;

let lightning_colour = null;
let background_colour = null;

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
	while (newBolt.lastPoint[1] < max(DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH) / 2) {
		let newAngle = newBolt.lastPoint[0] + random(newBolt.momentum - 0.1, newBolt.momentum + 0.1);
		let newRadius = newBolt.lastPoint[1] + 10;
		newBolt.addPoint(newAngle, newRadius);
		if (newBolt.numBranches < newBolt.points.length / 12 && random() < 0.06) {
			bolts = bolts.concat(generateBolt(newAngle, newRadius, false, -newBolt.momentum));
			newBolt.numBranches += 1;
		}
		if (!isRoot && random() < 0.07) break;
	}
	bolts.push(newBolt);
	return bolts;
}

function setup() {
	colorMode(RGB, 255, 255, 255, 1);
	lightning_colour = color(255);
	background_colour = color(77, 0, 102);
	fade_colour = color(
		red(background_colour),
		green(background_colour),
		blue(background_colour),
		0.3
	);

	let canvas = createCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
	canvas.parent("mycanvas");
	background(background_colour);

	let bolts = [];
	for (let i = 0; i < 3; ++i) {
		bolts = bolts.concat(generateBolt(random(0, 2 * PI), 0, true, 0));
	}

	let centre = [DEFAULT_CANVAS_WIDTH / 2, DEFAULT_CANVAS_HEIGHT / 2];
	let gradientArr = [
		[20, 0.1],
		[12, 0.2],
		[7, 0.3],
		[5, 0.4],
		[4, 0.6],
		[3, 0.8],
		[1, 1]
	];
	for (let j = 0; j < gradientArr.length; ++j) {
		for (let k = 0; k < bolts.length; ++k) {
			let currentBolt = bolts[k];
			for (let i = 0; i < currentBolt.points.length - 1; ++i) {
				strokeWeight(gradientArr[j][0]);
				stroke(lerpColor(background_colour, lightning_colour, gradientArr[j][1]));
				line(
					cos(currentBolt.points[i][0]) * currentBolt.points[i][1] + centre[0],
					sin(currentBolt.points[i][0]) * currentBolt.points[i][1] + centre[1],
					cos(currentBolt.points[i+1][0]) * currentBolt.points[i+1][1] + centre[0],
					sin(currentBolt.points[i+1][0]) * currentBolt.points[i+1][1] + centre[1]
				);
			}
		}
	}
}
