const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const TRIANGLE_SIDE_LENGTH = 50;
const DISPLACEMENT_LIMIT = Math.round(TRIANGLE_SIDE_LENGTH / 4);
const COLOUR_VARIATION_LIMIT = 7;
const GRADIENT_SMOOTHNESS = 0.04;
const SQRT_3 = 1.732;

const SW_COLOUR = [0, 0, 0];
const NE_COLOUR = [255, 255, 255];

let canvas = null;
let points = [];
let triangles = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Triangle {
    constructor(point1, point2, point3) {
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
    }
}

function pointDistance(point1, point2) {
    return Math.round(Math.sqrt(
        Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    ));
}

function generatePoints() {
    let currentX = -TRIANGLE_SIDE_LENGTH;
    let currentY = -TRIANGLE_SIDE_LENGTH;
    let columnNumber = 0;

    while (currentX < CANVAS_WIDTH + 2 * TRIANGLE_SIDE_LENGTH) {
        let previousPointIndex = 0;
        let currentColumn = [];
        let previousColumn = points[points.length - 1];

        while (currentY < CANVAS_HEIGHT + 2 * TRIANGLE_SIDE_LENGTH) {
            // Create and store a new point.
            let newPoint = new Point(currentX, currentY);
            currentColumn.push(newPoint);
            currentY += TRIANGLE_SIDE_LENGTH;

            // If the point is at the top or far left, don't add triangles
            // around it.
            if (
                columnNumber === 0
                || previousPointIndex > previousColumn.length - 1
            ) continue;
            if (currentColumn.length === 1 && columnNumber % 2 === 0) continue;

            // Add the triangle above the new point.
            if (currentColumn.length >= 2) {
                let newTriangle = new Triangle(
                    newPoint,
                    currentColumn[currentColumn.length - 2],
                    previousColumn[previousPointIndex]
                );
                triangles.push(newTriangle);
            }

            // Add the triangle to the left of the new point.
            if (previousPointIndex < previousColumn.length - 1) {
                let newTriangle = new Triangle(
                    newPoint,
                    previousColumn[previousPointIndex],
                    previousColumn[previousPointIndex + 1]
                );
                triangles.push(newTriangle);
            }

            previousPointIndex += 1;
        }

        // Store the newly generated points.
        points.push(currentColumn);

        // Prepare to handle the next column.
        currentX += Math.round(TRIANGLE_SIDE_LENGTH * SQRT_3 / 2);
        currentY = -TRIANGLE_SIDE_LENGTH + (
            columnNumber % 2 === 1
            ? 0
            : Math.round(TRIANGLE_SIDE_LENGTH / 2)
        );
        columnNumber += 1;
    }
}

function adjustPoints() {
    for (let i = 0; i < points.length; i++) {
        let currentColumn = points[i];
        for (let j = 0; j < currentColumn.length; j++) {
            let currentPoint = currentColumn[j];

            // Randomly perturb the points.
            currentPoint.x += random(-DISPLACEMENT_LIMIT, DISPLACEMENT_LIMIT);
            currentPoint.y += random(-DISPLACEMENT_LIMIT, DISPLACEMENT_LIMIT);

            // Push the points farther apart on the right.
            currentPoint.x =
                (currentPoint.x < 0 ? -1 : 1)
                * Math.pow(currentPoint.x, 3)
                / Math.pow(CANVAS_WIDTH, 2)
                - TRIANGLE_SIDE_LENGTH;
            currentPoint.y =
                (currentPoint.y - CANVAS_HEIGHT / 2)
                * Math.pow(currentPoint.x + CANVAS_WIDTH, 2)
                / Math.pow(CANVAS_WIDTH, 2)
                + CANVAS_HEIGHT / 2;
        }
    }
}

function displayTriangles() {
    // Draw the triangles.
    noStroke();
    for (let i = 0; i < triangles.length; i++) {
        let currentTriangle = triangles[i];

        // Choose a colour for the current triangle.
        let swCorner = new Point(0, CANVAS_HEIGHT);
        let neCorner = new Point(CANVAS_WIDTH, 0);
        const CANVAS_DIAGONAL_LENGTH = pointDistance(swCorner, neCorner);
        let currentTriangleProportion =
            pointDistance(currentTriangle.point3, neCorner)
            / CANVAS_DIAGONAL_LENGTH
            + random(-GRADIENT_SMOOTHNESS, GRADIENT_SMOOTHNESS);
        let currentRed = Math.round(
            (SW_COLOUR[0] - NE_COLOUR[0]) * currentTriangleProportion
            + NE_COLOUR[0]
        ) + random(-COLOUR_VARIATION_LIMIT, COLOUR_VARIATION_LIMIT+1);
        let currentGreen = Math.round(
            (SW_COLOUR[1] - NE_COLOUR[1]) * currentTriangleProportion
            + NE_COLOUR[1]
        ) + random(-COLOUR_VARIATION_LIMIT, COLOUR_VARIATION_LIMIT+1);
        let currentBlue = Math.round(
            (SW_COLOUR[2] - NE_COLOUR[2]) * currentTriangleProportion
            + NE_COLOUR[2]
        ) + random(-COLOUR_VARIATION_LIMIT, COLOUR_VARIATION_LIMIT+1);
        stroke(currentRed, currentGreen, currentBlue);
        fill(currentRed, currentGreen, currentBlue);

        triangle(
            currentTriangle.point1.x, currentTriangle.point1.y,
            currentTriangle.point2.x, currentTriangle.point2.y,
            currentTriangle.point3.x, currentTriangle.point3.y
        );
    }
}

function setup() {
    canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent("mycanvas");
    background(0);

    generatePoints();
    adjustPoints();
    displayTriangles();
}

function draw() {}
