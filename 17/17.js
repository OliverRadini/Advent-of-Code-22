const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data17_2";

const input = readFileSync(filePath, "utf8")
    .split("");


const MAX_DROPS = 2022;
const GRID_WIDTH = 7;
const rawBlocks =  [[
        "####",
        "....",
        "....",
        "....",
    ],
    [
        ".#..",
        "###.",
        ".#..",
        "....",
    ],
    [
        "..#.",
        "..#.",
        "###.",
        "....",
    ],
    [
        "#...",
        "#...",
        "#...",
        "#...",
    ],
    [
        "##..",
        "##..",
        "....",
        "....",
    ]
];

const blockStartingXPositions = [
    2,
]

const BLOCKS = rawBlocks
    .map(rawBlockLines => {
        const thisBlockParts = [];
        for (let y = 0; y < rawBlockLines.length; y++) {
            const thisLine = rawBlockLines[y];
            for (let x = 0; x < thisLine.length; x++) {
                if (rawBlockLines[y][x] === "#") {
                    thisBlockParts.push([x, y])
                }
            }
        }
        return thisBlockParts;
    });

const BLOCK_HEIGHT = BLOCKS[0].length;
const GRID_HEIGHT = MAX_DROPS * BLOCK_HEIGHT;

const state = {
    grid: Array.from(Array(GRID_HEIGHT))
        .map(() => Array.from(Array(GRID_WIDTH)).map(() => ".")),
};


let blockPosition = [0, 0]
let windIndex = 0;

function gridIsClearAt([x, y]) {
    try {
        return state.grid[y][x] === ".";
    } catch (e) {
        return false;
    }
}

function fill([x, y]) {
    try {
        state.grid[y][x] = "#";
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const addVectors = a => b => [a[0] + b[0], a[1] + b[1]];

let currentBlock;
let maxHeightRestingPosition = Infinity;

const logGrid = (x1 = 0, y1 = 0, x2 = GRID_WIDTH, y2 = GRID_HEIGHT) => {
    if (!currentBlock) {
        return;
    }
    const currentBlockPositions = currentBlock.map(addVectors(blockPosition));

    const gridToLog = state.grid
        .map((line, y) => {
            return line.map((v, x) => {
                const isABlock = currentBlockPositions.some(([xb, yb]) => yb === y && xb === x);

                return isABlock ? "@" : v;
            });
        })
        .slice(y1, y2)
        .map(line => line.slice(x1, x2))

    console.log(
        [...gridToLog, Array.from(Array(GRID_WIDTH)).map(() => "-")]
            .map(line => `|${line.join("")}|`)
            .join("\n")
    );
};

for (let i = 0; i < MAX_DROPS; i++) {
    let windIndex = 0;
    currentBlock = BLOCKS[i % BLOCKS.length];
    blockPosition = [2, 0];

    // console.log(`
    //     Dropping block ${i}
    // `);
    let hasCollided = false;
    
    let dropIndex = 0;
    while (!hasCollided) {
        dropIndex++;

        const thisWindMovement = input[windIndex % input.length];

        // console.log(thisWindMovement);
        // logGrid();

        const transformToCheck = thisWindMovement === "<"
            ? [-1, 0] : [1, 0];
        const nextPositions = currentBlock
            .map(addVectors(blockPosition))
            .map(addVectors(transformToCheck));
        const canMoveToNext = nextPositions.every(gridIsClearAt);

        if (canMoveToNext) {
            blockPosition = addVectors(blockPosition)(transformToCheck);
        }
        windIndex++;
        
        const nextDownwardPositions = currentBlock
            .map(addVectors(blockPosition))
            .map(addVectors([0, 1]));

        const canMoveDown = nextDownwardPositions.every(gridIsClearAt);

        // console.log(`
        //     - Block ${i}
        //     - Drop ${dropIndex}
        //     - Moving ${thisWindMovement}
        //     - canMoveToNext? ${canMoveToNext}
        //     - canMoveDown? ${canMoveDown}
        // `);
        // console.log("---")

        if (canMoveDown) {
            // console.log(`next block positions will be:`)
            // console.log(nextDownwardPositions.map(p => `${p[0]}, ${p[1]}`).join("\n"));
            blockPosition = addVectors(blockPosition)([0, 1]);
        } else {
            const restingPositions = currentBlock
                .map(addVectors(blockPosition));

            // console.log(`resting positions will be:`)
            // console.log(restingPositions.map(p => `${p[0]}, ${p[1]}`).join("\n"));

            // console.log(``)
            const minRestingPosition = restingPositions.reduce(
                (p, c) => c[1] < p ? c[1] : p, Infinity
            );

            if (minRestingPosition < maxHeightRestingPosition) {
                maxHeightRestingPosition = minRestingPosition;
            }

            restingPositions.forEach(fill);
            hasCollided = true;
        }
    }
}

logGrid();
console.log(maxHeightRestingPosition);