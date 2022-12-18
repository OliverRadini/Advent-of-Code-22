const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data14";

const rockLines = readFileSync(filePath, "utf8")
    .split("\n")
    .map(x => x.split(" -> ").map(y => y.split(",").map(Number)));

const gridWidth = Math.max(...rockLines.flatMap(x => x.flatMap(y => y[0] + 1)));
const gridHeight = Math.max(...rockLines.flatMap(x => x.flatMap(y => y[1] + 1)));


let grid = Array.from(Array(gridHeight))
    .map(() => Array.from(Array(gridWidth)).map(() => "."));

grid = [...grid, grid[0].map(() => "."), grid[0].map(() => "#")];

const diffToStep = diff => diff === 0
    ? 0
    : (diff / Math.abs(diff));


// add lines to grid
let currentCoord = [];
for (let i = 0; i < rockLines.length; i++) {
    const thesePoints = rockLines[i];
    for (let p = 0; p < thesePoints.length - 1; p++) {
        const fromX = thesePoints[p][0] - 1;
        const fromY = thesePoints[p][1] - 1;
        const toX = thesePoints[p + 1][0] - 1;
        const toY = thesePoints[p + 1][1] - 1;

        const xDiff = toX - fromX;
        const yDiff = toY - fromY;

        const xStep = diffToStep(xDiff);
        const yStep = diffToStep(yDiff);

        currentCoord = [fromX - 1, fromY];
        const numberOfPoints = Math.abs(xDiff) + Math.abs(yDiff);
        for (let x = 0; x <= numberOfPoints; x++) {
            grid[currentCoord[1]][currentCoord[0]] = "#";
            currentCoord = [currentCoord[0] + xStep, currentCoord[1] + yStep];
        }
    }
}

let lastGrid;
const printGrid = (gridInput = grid, x1 = 0, y1 = 0, x2 = gridWidth, y2 = gridHeight) => {
    const gridClone = gridInput.map(line => [...line]);
    gridClone.unshift(grid[0].map((_, i) => i === 498 ? "+" : " "));
    const printableGrid = gridClone
        .map((line, index) => [...line, index])
        .slice(y1, y2 + 1)
        .map(
            (line, cY) => line
                .slice(x1, x2+1)
        );
    lastGrid = [...printableGrid.map(line => [...line])];
    const printable = printableGrid.map(line => line.join("")).join("\n");
    console.log(printable);
};

// printGrid(grid, 460, 0, 520, 100);
// printGrid(grid, 490, 0, 520, 20);

const getValueAtCoord = (x, y) => {
    try {
        return grid[y][x];
    } catch (err) {
        return null;
    }
}

let sandHasFallen = false;

const movePreferences = [
    (x, y) => [ x, y + 1 ],
    (x, y) => [ x - 1, y + 1 ],
    (x, y) => [ x + 1, y + 1 ],
];

const getNextSandPositionFrom = (x, y) => {
    try {
        const nextValueDown = getValueAtCoord(x, y + 1);
        if (nextValueDown === null) {
            return null;
        }

        // const onRock = nextValueDown === "#";

        // if (onRock) {
        //     return [x, y];
        // }

        const nextPositions = movePreferences
            .map(f => f(x, y))
            .map(([nX, nY]) => ({
                value: getValueAtCoord(nX, nY),
                coord: [nX, nY]
            }));

        if (droppedGrains >= 30 && x === 498 && y > 8) {
            // printGrid(grid, 460, 0, 520, 100);
            // console.log(droppedGrains);
        }

        
        const nextPosition = nextPositions
            .find(x => x.value === ".")

        if (nextPosition === undefined) {
            return [x,y];
        }

        return nextPosition.coord;
    } catch (error) {
        console.log(error);
    }
};

const diagCoord = ([x, y]) => `(${x}, ${y})`;

const delayPromise = (ms) => new Promise(res => {
    setTimeout(res, ms);
});

let done = false;
let droppedGrains = 0;
const dropGrain = () => {
    console.log(droppedGrains)
    // printGrid(grid, 460, 0, 520, 100);
    // printGrid(grid, 490, 0, 520, 20);
    console.log(droppedGrains)
    try {
        let currentGrainPosition = [498, 0];
        let nextPosition = getNextSandPositionFrom(...currentGrainPosition);

        while(nextPosition[0] !== currentGrainPosition[0] || nextPosition[1] !== currentGrainPosition[1]) {
            grid[currentGrainPosition[1]][currentGrainPosition[0]] = '.';
            currentGrainPosition = nextPosition;
            grid[currentGrainPosition[1]][currentGrainPosition[0]] = 'o';
            nextPosition = getNextSandPositionFrom(
                currentGrainPosition[0],
                currentGrainPosition[1]
            );
            // printGrid(grid, 480, 0, 520, 40);

            if (droppedGrains >= 30) {
                // console.log(droppedGrains);
            }

            if (nextPosition === null) {
                sandHasFallen = true;
                break;
            }
        }

        droppedGrains++;

        if (grid[0][498] === "o") {
            done = true;
        }

        if (droppedGrains % 100 === 0) {
            printGrid(grid, 480, 0, 520, 100);
        }

        return;
    } catch (err) {
        console.log(err);
    }
};


while(!done) {
    dropGrain();
}

printGrid(grid, 0, 0, 50, 100);
console.log(droppedGrains);