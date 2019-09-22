const SQRT_3 = Math.sqrt(3);

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 900;

const BRICK = "Brick";
const LUMBER = "Lumber";
const WOOL = "Wool";
const GRAIN = "Grain";
const ORE = "Ore";
const DESERT = "Desert";
const ANY = "Any";
const HEX_TYPES = [BRICK, LUMBER, WOOL, GRAIN, ORE, DESERT];

const NORTH = "N";
const NORTHEAST = "NE";
const NORTHWEST = "NW";
const SOUTH = "S";
const SOUTHEAST = "SE";
const SOUTHWEST = "SW";

const HEXAGON_SIDE_LENGTH = 85;
const HEXAGON_WIDTH = Math.round(HEXAGON_SIDE_LENGTH * SQRT_3);
const MARGIN_WIDTH = 0;
const BORDER_WIDTH = 80;
const BEACH_WIDTH = 10;
const PORT_LENGTH = 45;

let brickColour = null;
let lumberColour = null;
let woolColour = null;
let grainColour = null;
let oreColour = null;
let desertColour = null;
let waterColour = null;

// HELPERS

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Hexagon {
	constructor(sideLength, nwX, nwY) {
		let halfSideLength = round(sideLength / 2);
		let halfWidth = round(halfSideLength * SQRT_3);
		this.nwX = nwX;
		this.nwY = nwY;
		this.width = 2 * halfWidth;
		this.height = 2 * sideLength;

		this.points = [
			new Point(nwX, nwY + halfSideLength),
			new Point(nwX + halfWidth, nwY),
			new Point(nwX + this.width, nwY + halfSideLength),
			new Point(nwX + this.width, nwY + halfSideLength + sideLength),
			new Point(nwX + halfWidth, nwY + 2 * sideLength),
			new Point(nwX, nwY + halfSideLength + sideLength)
		];
	}
}

class Tile {
	constructor(sideLength, nwX, nwY, tileType, number) {
		this.tileType = tileType;
		this.number = number;
		this.hexagon = new Hexagon(sideLength, nwX, nwY);
		this.hasRobber = (this.tileType === DESERT);
	}
}

class Port {
	constructor(point1, direction1, point2, direction2, portType) {
		this.point1 = point1;
		this.direction1 = direction1;
		this.point2 = point2;
		this.direction2 = direction2;
		this.portType = portType;
	}
}

function getNumPips(n) {
	if (n < 2 || n > 12 || n === 7) {
		return -1;
	}

	return 6 - abs(7 - n);
}

function getTileColour(type) {
	if (type === BRICK) return brickColour;
	if (type === LUMBER) return lumberColour;
	if (type === WOOL) return woolColour;
	if (type === GRAIN) return grainColour;
	if (type === ORE) return oreColour;
	if (type === DESERT) return desertColour;
}

function drawBrickSymbol(x, y, radius) {
	noStroke();
	fill(0);
	const brick_width = 0.95 * radius;
	const brick_height = 0.4 * radius;
	rect(x - 0.475 * radius, y - 0.7 * radius, brick_width, brick_height);
	rect(x - radius, y - 0.2 * radius, brick_width, brick_height);
	rect(x + 0.05 * radius, y - 0.2 * radius, brick_width, brick_height);
	rect(x - 0.475 * radius, y + 0.3 * radius, brick_width, brick_height);
}

function drawLumberSymbol(x, y, radius) {
	noStroke();
	fill(0);
	beginShape();
	vertex(x, y - radius);
	vertex(x + 0.5 * radius, y - 0.5 * radius);
	vertex(x + 0.3 * radius, y - 0.5 * radius);
	vertex(x + 0.8 * radius, y + 0.1 * radius);
	vertex(x + 0.55 * radius, y + 0.1 * radius);
	vertex(x + radius, y + 0.7 * radius);
	vertex(x + 0.25 * radius, y + 0.7 * radius);
	vertex(x + 0.25 * radius, y + radius);
	vertex(x - 0.25 * radius, y + radius);
	vertex(x - 0.25 * radius, y + 0.7 * radius);
	vertex(x - radius, y + 0.7 * radius);
	vertex(x - 0.55 * radius, y + 0.1 * radius);
	vertex(x - 0.8 * radius, y + 0.1 * radius);
	vertex(x - 0.3 * radius, y - 0.5 * radius);
	vertex(x - 0.5 * radius, y - 0.5 * radius);
	endShape(CLOSE);
}

function drawWoolSymbol(x, y, radius) {
	noStroke();
	fill(0);
	ellipse(x + 0.5 * radius, y - 0.1 * radius, 0.7 * radius);
	ellipse(x - 0.5 * radius, y - 0.2 * radius, 0.6 * radius);
	ellipse(x + 0.3 * radius, y + 0.4 * radius, 0.6 * radius);
	ellipse(x - 0.3 * radius, y + 0.4 * radius, 0.7 * radius);
	ellipse(x, y - 0.4 * radius, 0.8 * radius);
	ellipse(x, y, 0.8 * radius);
}

function drawGrainSymbol(x, y, radius) {
	noStroke();
	fill(0);
	beginShape();
	vertex(x - 0.05 * radius, y + 0.7 * radius);
	curveVertex(x - 0.5 * radius, y + 0.65 * radius);
	vertex(x - 0.8 * radius, y + 0.25 * radius);
	vertex(x - 0.8 * radius, y + 0.25 * radius);
	vertex(x - 0.8 * radius, y + 0.25 * radius);
	curveVertex(x - 0.3 * radius, y + 0.3 * radius);
	endShape(CLOSE);
	beginShape();
	vertex(x - 0.05 * radius, y + 0.2 * radius);
	curveVertex(x - 0.5 * radius, y + 0.15 * radius);
	vertex(x - 0.8 * radius, y - 0.25 * radius);
	vertex(x - 0.8 * radius, y - 0.25 * radius);
	vertex(x - 0.8 * radius, y - 0.25 * radius);
	curveVertex(x - 0.3 * radius, y - 0.2 * radius);
	endShape(CLOSE);
	beginShape();
	vertex(x - 0.05 * radius, y - 0.3 * radius);
	curveVertex(x - 0.5 * radius, y - 0.35 * radius);
	vertex(x - 0.8 * radius, y - 0.75 * radius);
	vertex(x - 0.8 * radius, y - 0.75 * radius);
	vertex(x - 0.8 * radius, y - 0.75 * radius);
	curveVertex(x - 0.3 * radius, y - 0.7 * radius);
	endShape(CLOSE);
	beginShape();
	vertex(x + 0.05 * radius, y + 0.7 * radius);
	curveVertex(x + 0.5 * radius, y + 0.65 * radius);
	vertex(x + 0.8 * radius, y + 0.25 * radius);
	vertex(x + 0.8 * radius, y + 0.25 * radius);
	vertex(x + 0.8 * radius, y + 0.25 * radius);
	curveVertex(x + 0.3 * radius, y + 0.3 * radius);
	endShape(CLOSE);
	beginShape();
	vertex(x + 0.05 * radius, y + 0.2 * radius);
	curveVertex(x + 0.5 * radius, y + 0.15 * radius);
	vertex(x + 0.8 * radius, y - 0.25 * radius);
	vertex(x + 0.8 * radius, y - 0.25 * radius);
	vertex(x + 0.8 * radius, y - 0.25 * radius);
	curveVertex(x + 0.3 * radius, y - 0.2 * radius);
	endShape(CLOSE);
	beginShape();
	vertex(x + 0.05 * radius, y - 0.3 * radius);
	curveVertex(x + 0.5 * radius, y - 0.35 * radius);
	vertex(x + 0.8 * radius, y - 0.75 * radius);
	vertex(x + 0.8 * radius, y - 0.75 * radius);
	vertex(x + 0.8 * radius, y - 0.75 * radius);
	curveVertex(x + 0.3 * radius, y - 0.7 * radius);
	endShape(CLOSE);
	ellipse(x, y - 0.9 * radius, 0.35 * radius, 0.45 * radius);
}

function drawOreSymbol(x, y, radius) {
	noStroke();
	fill(0);
	beginShape();
	vertex(x - 0.45 * SQRT_3 * radius, y - 0.45 * radius);
	vertex(x, y - 0.9 * radius);
	vertex(x + 0.45 * SQRT_3 * radius, y - 0.45 * radius);
	vertex(x + 0.45 * SQRT_3 * radius, y + 0.45 * radius);
	vertex(x, y + 0.9 * radius);
	vertex(x - 0.45 * SQRT_3 * radius, y + 0.45 * radius);
	endShape(CLOSE);
}

function drawDesertSymbol(x, y, radius, hasRobber) {
	if (!hasRobber) {
		stroke(0);
	} else {
		stroke(desertColour);
	}
	strokeWeight(radius / 4);
	noFill();
	line(x, y - radius * 1.1, x, y + radius * 0.9);
	beginShape();
	vertex(x - radius / 2, y - radius * 2 / 3);
	curveVertex(x - radius / 2, y - radius * 2 / 3);
	curveVertex(x - radius / 2, y + radius / 4);
	curveVertex(x + radius / 2, y + radius / 4);
	curveVertex(x + radius / 2, y - radius / 2);
	vertex(x + radius / 2, y - radius / 2);
	endShape();
}

function _getPointAfterMove(initPoint, direction, distance) {
	let ret = new Point(initPoint.x, initPoint.y);
	if (direction === NORTH) {
		ret.y -= distance;
	} else if (direction === SOUTH) {
		ret.y += distance;
	} else {
		let vertDelta = round(distance / 2);
		let horizDelta = round(distance * SQRT_3 / 2);
		if (direction === NORTHEAST) {
			ret.x += horizDelta;
			ret.y -= vertDelta;
		} else if (direction === NORTHWEST) {
			ret.x -= horizDelta;
			ret.y -= vertDelta;
		} else if (direction === SOUTHEAST) {
			ret.x += horizDelta;
			ret.y += vertDelta;
		} else {  // direction === SOUTHWEST
			ret.x -= horizDelta;
			ret.y += vertDelta;
		}
	}
	return ret;
}

function generateTiles() {
	let tiles = [];
	let tileRow = [];
	let currentTile = null;

	let num = 0;

	for (let i = 0; i < 3; ++i) {
		do {
			num = floor(random(2,13));
		} while (num === 7);
		currentTile = new Tile(HEXAGON_SIDE_LENGTH, BORDER_WIDTH + (i + 1) * (HEXAGON_WIDTH + MARGIN_WIDTH), BORDER_WIDTH, HEX_TYPES[floor(random(HEX_TYPES.length))], num);
		tileRow.push(currentTile);
	}
	tiles.push(tileRow);
	tileRow = [];
	for (let i = 0; i < 4; ++i) {
		do {
			num = floor(random(2,13));
		} while (num === 7);
		currentTile = new Tile(HEXAGON_SIDE_LENGTH, BORDER_WIDTH + (i + 0.5) * (HEXAGON_WIDTH + MARGIN_WIDTH), tiles[tiles.length - 1][0].hexagon.points[5].y, HEX_TYPES[floor(random(HEX_TYPES.length))], num);
		tileRow.push(currentTile);
	}
	tiles.push(tileRow);
	tileRow = [];
	for (let i = 0; i < 5; ++i) {
		do {
			num = floor(random(2,13));
		} while (num === 7);
		currentTile = new Tile(HEXAGON_SIDE_LENGTH, BORDER_WIDTH + i * (HEXAGON_WIDTH + MARGIN_WIDTH), tiles[tiles.length - 1][0].hexagon.points[5].y, HEX_TYPES[floor(random(HEX_TYPES.length))], num);
		tileRow.push(currentTile);
	}
	tiles.push(tileRow);
	tileRow = [];
	for (let i = 0; i < 4; ++i) {
		do {
			num = floor(random(2,13));
		} while (num === 7);
		currentTile = new Tile(HEXAGON_SIDE_LENGTH, BORDER_WIDTH + (i + 0.5) * (HEXAGON_WIDTH + MARGIN_WIDTH), tiles[tiles.length - 1][0].hexagon.points[5].y, HEX_TYPES[floor(random(HEX_TYPES.length))], num);
		tileRow.push(currentTile);
	}
	tiles.push(tileRow);
	tileRow = [];
	for (let i = 0; i < 3; ++i) {
		do {
			num = floor(random(2,13));
		} while (num === 7);
		currentTile = new Tile(HEXAGON_SIDE_LENGTH, BORDER_WIDTH + (i + 1) * (HEXAGON_WIDTH + MARGIN_WIDTH), tiles[tiles.length - 1][0].hexagon.points[5].y, HEX_TYPES[floor(random(HEX_TYPES.length))], num);
		tileRow.push(currentTile);
	}
	tiles.push(tileRow);
	return tiles;
}

function drawHexagon(tile) {
	hexagon = tile.hexagon;
	colour = getTileColour(tile.tileType);
	stroke(0);
	strokeWeight(BEACH_WIDTH);
	fill(colour);
	beginShape();
	for (let i = 0; i < hexagon.points.length; ++i) {
		vertex(hexagon.points[i].x, hexagon.points[i].y);
	}
	endShape(CLOSE);
}

function drawPips(numPips, x, y) {
	const pipRadius = 3;
	const pipGap = 3;
	const totalWidth = pipRadius * 2 * numPips + (numPips - 1) * pipGap;
	const centreSpacing = 2 * pipRadius + pipGap;
	console.log(centreSpacing);
	let currentX = x - totalWidth / 2 + pipRadius;
	for (let i = 0; i < numPips; ++i) {
		ellipse(currentX, y, pipRadius * 2);
		currentX += centreSpacing;
	}
}

function drawNumCircle(tile) {
	noStroke();
	if (tile.hasRobber) {
		fill(0);
	} else {
		fill(lerpColor(getTileColour(tile.tileType), color(255), 0.3));
	}

	if (tile.tileType === DESERT) {
		ellipse(tile.hexagon.nwX + tile.hexagon.width / 2, tile.hexagon.nwY + tile.hexagon.height / 2, tile.hexagon.width * 5 / 8);
	} else {
		ellipse(tile.hexagon.nwX + tile.hexagon.width / 2, tile.hexagon.nwY + tile.hexagon.height * 5 / 8, tile.hexagon.width * 5 / 12);

		fill(0);
		textAlign(CENTER, TOP);
		textSize(30);
		textFont("serif");
		text(tile.number.toString(), tile.hexagon.nwX + tile.hexagon.width / 2, tile.hexagon.nwY + tile.hexagon.height / 2);

		let numPips = getNumPips(tile.number);
		drawPips(numPips, tile.hexagon.nwX + tile.hexagon.width / 2, tile.hexagon.nwY + tile.hexagon.height * 11 / 16);
	}
}

function drawTileSymbol(tile) {
	let x = 0;
	let y = 0;
	let radius = 0;
	if (tile.tileType === DESERT) {
		x = tile.hexagon.nwX + tile.hexagon.width / 2;
		y = tile.hexagon.nwY + tile.hexagon.height / 2;
		radius = tile.hexagon.width / 5;
	} else {
		x = tile.hexagon.nwX + tile.hexagon.width / 2;
		y = tile.hexagon.nwY + tile.hexagon.height / 4;
		radius = tile.hexagon.width / 7;
	}

	if (tile.tileType === BRICK) drawBrickSymbol(x, y, radius);
	else if (tile.tileType === LUMBER) drawLumberSymbol(x, y, radius);
	else if (tile.tileType === WOOL) drawWoolSymbol(x, y, radius);
	else if (tile.tileType === GRAIN) drawGrainSymbol(x, y, radius);
	else if (tile.tileType === ORE) drawOreSymbol(x, y, radius);
	else drawDesertSymbol(x, y, radius, tile.hasRobber);
}

function drawTile(tile) {
	drawHexagon(tile);
	drawNumCircle(tile);
	drawTileSymbol(tile);
}

function drawTiles(tiles) {
	for (let i = 0; i < tiles.length; ++i) {
		let currentRow = tiles[i];
		for (let j = 0; j < currentRow.length; ++j) {
			drawTile(currentRow[j]);
		}
	}
}

function generatePorts(tiles) {
	let ports = [];

	let p1 = tiles[0][0].hexagon.points[0];
	let d1 = NORTH;
	let p2 = tiles[0][0].hexagon.points[1];
	let d2 = NORTHWEST;
	let pType = ANY;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[0][1].hexagon.points[1];
	d1 = NORTHEAST;
	p2 = tiles[0][1].hexagon.points[2];
	d2 = NORTH;
	pType = WOOL;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[1][3].hexagon.points[1];
	d1 = NORTHEAST;
	p2 = tiles[1][3].hexagon.points[2];
	d2 = NORTH;
	pType = ANY;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[2][4].hexagon.points[2];
	d1 = SOUTHEAST;
	p2 = tiles[2][4].hexagon.points[3];
	d2 = NORTHEAST;
	pType = ANY;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[3][3].hexagon.points[3];
	d1 = SOUTH;
	p2 = tiles[3][3].hexagon.points[4];
	d2 = SOUTHEAST;
	pType = BRICK;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[4][1].hexagon.points[3];
	d1 = SOUTH;
	p2 = tiles[4][1].hexagon.points[4];
	d2 = SOUTHEAST;
	pType = LUMBER;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[4][0].hexagon.points[4];
	d1 = SOUTHWEST;
	p2 = tiles[4][0].hexagon.points[5];
	d2 = SOUTH;
	pType = ANY
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[3][0].hexagon.points[5];
	d1 = NORTHWEST;
	p2 = tiles[3][0].hexagon.points[0];
	d2 = SOUTHWEST;
	pType = GRAIN;
	ports.push(new Port(p1, d1, p2, d2, pType));

	p1 = tiles[1][0].hexagon.points[5];
	d1 = NORTHWEST;
	p2 = tiles[1][0].hexagon.points[0];
	d2 = SOUTHWEST;
	pType = ORE;
	ports.push(new Port(p1, d1, p2, d2, pType));

	return ports;
}

function drawPorts(ports) {
	stroke(0);
	strokeWeight(BEACH_WIDTH);
	noFill();
	for (let i = 0; i < ports.length; ++i) {
		let port = ports[i];
		let portEnd1 = _getPointAfterMove(port.point1, port.direction1, PORT_LENGTH);
		let portEnd2 = _getPointAfterMove(port.point2, port.direction2, PORT_LENGTH);
		line(port.point1.x, port.point1.y, portEnd1.x, portEnd1.y);
		line(port.point2.x, port.point2.y, portEnd2.x, portEnd2.y);
	}
}

// MAIN

function setup() {
	brickColour = color(232, 88, 14);
	lumberColour = color(28, 123, 0);
	woolColour = color(234, 234, 234);
	grainColour = color(230, 200, 0);
	oreColour = color(158, 158, 158);
	desertColour = color(199, 180, 107);
	waterColour = color(184, 227, 252);

	let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	canvas.parent("mycanvas");
	background(waterColour);

	let tiles = generateTiles();
	drawTiles(tiles);

	let ports = generatePorts(tiles);
	drawPorts(ports);
}
