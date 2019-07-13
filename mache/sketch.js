// Useful for dealing with special triangles.
const SQRT_3 = 1.732;

const CANVAS_WIDTH_NAME = "CanvasWidth";
const DEFAULT_CANVAS_WIDTH = 1200;
const MIN_CANVAS_WIDTH = 10;
let canvasWidth = DEFAULT_CANVAS_WIDTH;

const CANVAS_HEIGHT_NAME = "CanvasHeight";
const DEFAULT_CANVAS_HEIGHT = 800;
const MIN_CANVAS_HEIGHT = 10;
let canvasHeight = DEFAULT_CANVAS_HEIGHT;

const TRIANGLE_SIDE_LENGTH_NAME = "TriangleSideLength";
const DEFAULT_TRIANGLE_SIDE_LENGTH = 50;
const MIN_TRIANGLE_SIDE_LENGTH = 20;
const MAX_TRIANGLE_SIDE_LENGTH = 150;
let triangleSideLength = DEFAULT_TRIANGLE_SIDE_LENGTH;

const DISPLACEMENT_LIMIT_NAME = "DisplacementLimit";
const DEFAULT_DISPLACEMENT_LIMIT = 15;
const MIN_DISPLACEMENT_LIMIT = 0;
const MAX_DISPLACEMENT_LIMIT = 75;
let displacementLimit = DEFAULT_DISPLACEMENT_LIMIT;

const COLOUR_VARIATION_LIMIT = 7;
const GRADIENT_SMOOTHNESS = 0.04;

const SW_COLOUR = [0, 0, 0];
const NE_COLOUR = [255, 255, 255];

let canvas = null;
let points = [];
let triangles = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.displayedX = x;
        this.displayedY = y;
    }
}

class Triangle {
    constructor(point1, point2, point3) {
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
    }
}


// Return x if a <= x <= b; if x < a, return a; if x > b, return b.
function constrain(x, a, b) {
    return max(a, min(x, b));
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

function pointDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
}

function generatePoints() {
    let currentX = -triangleSideLength;
    let currentY = -triangleSideLength;
    let columnNumber = 0;

    while (currentX < canvasWidth + 2 * triangleSideLength) {
        let previousPointIndex = 0;
        let currentColumn = [];
        let previousColumn = points[points.length - 1];

        while (currentY < canvasHeight + 2 * triangleSideLength) {
            // Create and store a new point.
            let newPoint = new Point(currentX, currentY);
            currentColumn.push(newPoint);
            currentY += triangleSideLength;

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
        currentX += round(triangleSideLength * SQRT_3 / 2);
        currentY = -triangleSideLength + (
            columnNumber % 2 === 1
            ? 0
            : round(triangleSideLength / 2)
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
            currentPoint.displayedX =
                currentPoint.x
                + random(-displacementLimit, displacementLimit);
            currentPoint.displayedY =
                currentPoint.y
                + random(-displacementLimit, displacementLimit);

            // Push the points farther apart on the right.
            currentPoint.x = round(
                (currentPoint.x < 0 ? -1 : 1)
                * Math.pow(currentPoint.x, 3)
                / Math.pow(canvasWidth, 2)
                - triangleSideLength
            );
            currentPoint.y = round(
                (currentPoint.y - canvasHeight / 2)
                * Math.pow(currentPoint.x + canvasWidth, 2)
                / Math.pow(canvasWidth, 2)
                + canvasHeight / 2
            );
            currentPoint.displayedX = round(
                (currentPoint.displayedX < 0 ? -1 : 1)
                * Math.pow(currentPoint.displayedX, 3)
                / Math.pow(canvasWidth, 2)
                - triangleSideLength
            );
            currentPoint.displayedY = round(
                (currentPoint.displayedY - canvasHeight / 2)
                * Math.pow(currentPoint.displayedX + canvasWidth, 2)
                / Math.pow(canvasWidth, 2)
                + canvasHeight / 2
            );
        }
    }
}

function displayTriangles() {
    // Draw the triangles.
    noStroke();
    for (let i = 0; i < triangles.length; i++) {
        let currentTriangle = triangles[i];

        // Choose a colour for the current triangle.
        let swCorner = new Point(0, canvasHeight);
        let neCorner = new Point(canvasWidth, 0);
        const CANVAS_DIAGONAL_LENGTH = pointDistance(swCorner, neCorner);
        let currentTriangleProportion =
            pointDistance(currentTriangle.point3, neCorner)
            / CANVAS_DIAGONAL_LENGTH
            + random(-GRADIENT_SMOOTHNESS, GRADIENT_SMOOTHNESS);
        let currentRed = round(
            (SW_COLOUR[0] - NE_COLOUR[0]) * currentTriangleProportion
            + NE_COLOUR[0]
        ) + random(-COLOUR_VARIATION_LIMIT, COLOUR_VARIATION_LIMIT+1);
        let currentGreen = round(
            (SW_COLOUR[1] - NE_COLOUR[1]) * currentTriangleProportion
            + NE_COLOUR[1]
        ) + random(-COLOUR_VARIATION_LIMIT, COLOUR_VARIATION_LIMIT+1);
        let currentBlue = round(
            (SW_COLOUR[2] - NE_COLOUR[2]) * currentTriangleProportion
            + NE_COLOUR[2]
        ) + random(-COLOUR_VARIATION_LIMIT, COLOUR_VARIATION_LIMIT+1);
        stroke(currentRed, currentGreen, currentBlue);
        fill(currentRed, currentGreen, currentBlue);

        triangle(
            currentTriangle.point1.displayedX, currentTriangle.point1.displayedY,
            currentTriangle.point2.displayedX, currentTriangle.point2.displayedY,
            currentTriangle.point3.displayedX, currentTriangle.point3.displayedY
        );
    }
}

function setup() {
    let params = getURLParameters();

    canvasWidth = round(params[CANVAS_WIDTH_NAME]);
    if (isNaN(canvasWidth))
        canvasWidth = DEFAULT_CANVAS_WIDTH;
    canvasWidth = constrain(canvasWidth, MIN_CANVAS_WIDTH, canvasWidth);
    let canvasWidthInput =
        document.getElementById(CANVAS_WIDTH_NAME);
    canvasWidthInput.value = canvasWidth.toString();

    canvasHeight = round(params[CANVAS_HEIGHT_NAME]);
    if (isNaN(canvasHeight))
        canvasHeight = DEFAULT_CANVAS_HEIGHT;
    canvasHeight = constrain(canvasHeight, MIN_CANVAS_HEIGHT, canvasHeight);
    let canvasHeightInput =
        document.getElementById(CANVAS_HEIGHT_NAME);
    canvasHeightInput.value = canvasHeight.toString();

    triangleSideLength = round(params[TRIANGLE_SIDE_LENGTH_NAME]);
    if (isNaN(triangleSideLength))
        triangleSideLength = DEFAULT_TRIANGLE_SIDE_LENGTH;
    triangleSideLength = constrain(
        triangleSideLength, MIN_TRIANGLE_SIDE_LENGTH, MAX_TRIANGLE_SIDE_LENGTH
    );
    let triangleSideLengthInput =
        document.getElementById(TRIANGLE_SIDE_LENGTH_NAME);
    triangleSideLengthInput.value = triangleSideLength.toString();

    displacementLimit = round(params[DISPLACEMENT_LIMIT_NAME]);
    if (isNaN(displacementLimit))
        displacementLimit = DEFAULT_DISPLACEMENT_LIMIT;
    displacementLimit = constrain(
        displacementLimit, MIN_DISPLACEMENT_LIMIT, MAX_DISPLACEMENT_LIMIT
    );
    let displacementLimitInput =
        document.getElementById(DISPLACEMENT_LIMIT_NAME);
    displacementLimitInput.value = displacementLimit;

    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("mycanvas");
    background(0);

    generatePoints();
    adjustPoints();
    displayTriangles();
}
