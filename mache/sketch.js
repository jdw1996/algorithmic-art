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

const COLOUR_VARIATION_LIMIT_NAME = "ColourVariationLimit";
const DEFAULT_COLOUR_VARIATION_LIMIT = 4;
const MIN_COLOUR_VARIATION_LIMIT = 0;
const MAX_COLOUR_VARIATION_LIMIT = 255;
let colourVariationLimit = DEFAULT_COLOUR_VARIATION_LIMIT

const GRADIENT_SMOOTHNESS_NAME = "GradientSmoothness";
const DEFAULT_GRADIENT_SMOOTHNESS = 4;
const MIN_GRADIENT_SMOOTHNESS = 0;
const MAX_GRADIENT_SMOOTHNESS = 100;
let gradientSmoothness = DEFAULT_GRADIENT_SMOOTHNESS;

const SW_COLOUR_RED_NAME = "SWColourRed";
const SW_COLOUR_GREEN_NAME = "SWColourGreen";
const SW_COLOUR_BLUE_NAME = "SWColourBlue";
const DEFAULT_SW_COLOUR_RED = 0;
const DEFAULT_SW_COLOUR_GREEN = 0;
const DEFAULT_SW_COLOUR_BLUE = 0;
let swColourRed = DEFAULT_SW_COLOUR_RED;
let swColourGreen = DEFAULT_SW_COLOUR_GREEN;
let swColourBlue = DEFAULT_SW_COLOUR_BLUE;

const NE_COLOUR_RED_NAME = "NEColourRed";
const NE_COLOUR_GREEN_NAME = "NEColourGreen";
const NE_COLOUR_BLUE_NAME = "NEColourBlue";
const DEFAULT_NE_COLOUR_RED = 255;
const DEFAULT_NE_COLOUR_GREEN = 255;
const DEFAULT_NE_COLOUR_BLUE = 255;
let neColourRed = DEFAULT_NE_COLOUR_RED;
let neColourGreen = DEFAULT_NE_COLOUR_GREEN;
let neColourBlue = DEFAULT_NE_COLOUR_BLUE;

const MIN_COLOUR_VALUE = 0;
const MAX_COLOUR_VALUE = 255;

const SAVE_BUTTON_NAME = "SaveButton";

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
            currentPoint.x =
                currentPoint.x
                + random(-displacementLimit, displacementLimit);
            currentPoint.y =
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
        }
    }
}

function displayTriangles() {
    for (let i = 0; i < triangles.length; i++) {
        let currentTriangle = triangles[i];

        // Choose a colour for the current triangle.
        let swCorner = new Point(0, canvasHeight);
        let neCorner = new Point(canvasWidth, 0);
        const CANVAS_DIAGONAL_LENGTH = pointDistance(swCorner, neCorner);
        let currentTriangleProportion =
            pointDistance(currentTriangle.point3, neCorner)
            / CANVAS_DIAGONAL_LENGTH
            + random(-gradientSmoothness/100, gradientSmoothness/100);
        let currentRed = round(
            (swColourRed - neColourRed) * currentTriangleProportion
            + neColourRed
        ) + random(-colourVariationLimit, colourVariationLimit + 1);
        let currentGreen = round(
            (swColourGreen - neColourGreen) * currentTriangleProportion
            + neColourGreen
        ) + random(-colourVariationLimit, colourVariationLimit + 1);
        let currentBlue = round(
            (swColourBlue - neColourBlue) * currentTriangleProportion
            + neColourBlue
        ) + random(-colourVariationLimit, colourVariationLimit + 1);
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

    swColourRed = round(params[SW_COLOUR_RED_NAME]);
    swColourGreen = round(params[SW_COLOUR_GREEN_NAME]);
    swColourBlue = round(params[SW_COLOUR_BLUE_NAME]);
    if (isNaN(swColourRed)) swColourRed = DEFAULT_SW_COLOUR_RED;
    if (isNaN(swColourGreen)) swColourGreen = DEFAULT_SW_COLOUR_GREEN;
    if (isNaN(swColourBlue)) swColourBlue = DEFAULT_SW_COLOUR_BLUE;
    swColourRed = constrain(swColourRed, MIN_COLOUR_VALUE, MAX_COLOUR_VALUE);
    swColourGreen =
        constrain(swColourGreen, MIN_COLOUR_VALUE, MAX_COLOUR_VALUE);
    swColourBlue = constrain(swColourBlue, MIN_COLOUR_VALUE, MAX_COLOUR_VALUE);
    let swColourRedInput = document.getElementById(SW_COLOUR_RED_NAME);
    swColourRedInput.value = swColourRed.toString();
    let swColourGreenInput = document.getElementById(SW_COLOUR_GREEN_NAME);
    swColourGreenInput.value = swColourGreen.toString();
    let swColourBlueInput = document.getElementById(SW_COLOUR_BLUE_NAME);
    swColourBlueInput.value = swColourBlue.toString();

    neColourRed = round(params[NE_COLOUR_RED_NAME]);
    neColourGreen = round(params[NE_COLOUR_GREEN_NAME]);
    neColourBlue = round(params[NE_COLOUR_BLUE_NAME]);
    if (isNaN(neColourRed)) neColourRed = DEFAULT_NE_COLOUR_RED;
    if (isNaN(neColourGreen)) neColourGreen = DEFAULT_NE_COLOUR_GREEN;
    if (isNaN(neColourBlue)) neColourBlue = DEFAULT_NE_COLOUR_BLUE;
    neColourRed = constrain(neColourRed, MIN_COLOUR_VALUE, MAX_COLOUR_VALUE);
    neColourGreen =
        constrain(neColourGreen, MIN_COLOUR_VALUE, MAX_COLOUR_VALUE);
    neColourBlue = constrain(neColourBlue, MIN_COLOUR_VALUE, MAX_COLOUR_VALUE);
    let neColourRedInput = document.getElementById(NE_COLOUR_RED_NAME);
    neColourRedInput.value = neColourRed.toString();
    let neColourGreenInput = document.getElementById(NE_COLOUR_GREEN_NAME);
    neColourGreenInput.value = neColourGreen.toString();
    let neColourBlueInput = document.getElementById(NE_COLOUR_BLUE_NAME);
    neColourBlueInput.value = neColourBlue.toString();

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

    colourVariationLimit = round(params[COLOUR_VARIATION_LIMIT_NAME]);
    if (isNaN(colourVariationLimit))
        colourVariationLimit = DEFAULT_COLOUR_VARIATION_LIMIT;
    colourVariationLimit = constrain(
        colourVariationLimit,
        MIN_COLOUR_VARIATION_LIMIT,
        MAX_COLOUR_VARIATION_LIMIT
    );
    let colourVariationLimitInput =
        document.getElementById(COLOUR_VARIATION_LIMIT_NAME);
    colourVariationLimitInput.value = colourVariationLimit;

    gradientSmoothness = round(params[GRADIENT_SMOOTHNESS_NAME]);
    if (isNaN(gradientSmoothness))
        gradientSmoothness = DEFAULT_GRADIENT_SMOOTHNESS;
    gradientSmoothness = constrain(
        gradientSmoothness,
        MIN_GRADIENT_SMOOTHNESS,
        MAX_GRADIENT_SMOOTHNESS
    );
    let gradientSmoothnessInput =
        document.getElementById(GRADIENT_SMOOTHNESS_NAME);
    gradientSmoothnessInput.value = gradientSmoothness;

    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("mycanvas");
    background(0);

    document.getElementById(SAVE_BUTTON_NAME).onclick = saveCanvas;

    generatePoints();
    adjustPoints();
    displayTriangles();
}
