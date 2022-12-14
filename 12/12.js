const { readFileSync } = require("fs");

const letterLookup = { S: 1, E: 26, a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26 };
const filename = process.argv[2] || "./data12_actual";
const input = readFileSync(filename, "utf8")
    .split("\n")
    .map(line => line.split(""));

const HEIGHT = input.length;

const findValue = (value) => {
    for (let y = 0; y < input.length; y++) {
        const line = input[y];
        for (let x = 0; x < line.length; x++) {
            if (input[y][x] === value) {
                return { x, y };
            }
        }
    }
    return null;
};

const startingCoord = findValue("S");
const endingCoord = findValue("E");

const tempCheckCoord = {
    x: endingCoord.x + 7,
    y: endingCoord.y,
};

if (startingCoord === null || endingCoord === null) {
    throw new Error("Can't find start/end");
}

const getValueAt = (at) => {
    try {
        return input[at.y][at.x];
    }
    catch (e) {
        return null;
    }
};

const getCoordinatesSurrounding = ({ x: xFrom, y: yFrom }) => {
    if (xFrom === tempCheckCoord.x && yFrom === tempCheckCoord.y) {
        // console.log("Getting surrounding for temp checking coord");
    }
    const allCoords = [
        { x: xFrom, y: yFrom + 1 },
        { x: xFrom, y: yFrom - 1 },
        { x: xFrom - 1, y: yFrom },
        { x: xFrom + 1, y: yFrom },
    ];

    return allCoords.filter(
        c => {
                try {
                    const isGreaterThanZero = c.x >= 0 && c.y >= 0;

                    if (!isGreaterThanZero) {
                        return false;
                    }
                    
                    const width = input[c.y].length;
                    const isWithinBounds = c.y < HEIGHT && c.x < width;

                    if (c.x === tempCheckCoord.x && c.y === tempCheckCoord - 1) {
                        // console.log(`isWithinBounds? ${isWithinBounds}`);
                    }

                    return isWithinBounds;
                } catch (error) {
                    // console.log(`Error finding coordinate (${c.x}, ${c.y})`);
                    return false;
                }
            }
        )
};

const coordHeightCache = {};

const getKeyForCoord = ({ x, y }) => `(${x}, ${y})`;

const coordsAreEqual = a => b => a.x === b.x && a.y === b.y;

const walkIsViable = a => b => {
    return letterLookup[b] - letterLookup[a] <= 1;
};

let allNodes = input
    .map((line, y) => line.map((v, x) => ({ x, y, v, parents: [], children: [], cost: -1 })));

const getAllNodeAtCoord = (coord) => allNodes[coord.y][coord.x];

const getNodeschildren = node => {
    if (node.x === tempCheckCoord.x && node.y === tempCheckCoord.y) {
        // console.log("Getting children for temp checking coord");
    }
    // TODO: make sure we're not using map/filter here as it'll return a copy
    const surrounding = getCoordinatesSurrounding(node);
    const allNodes = surrounding.map(getAllNodeAtCoord);
    const nodesToReturn = []
    for (let i = 0; i < allNodes.length; i++) {
        const thisNode = allNodes[i]
        if (
            !!thisNode
                && walkIsViable(node.v)(thisNode.v)
        ) {
            nodesToReturn.push(thisNode);
        }
    }
    return nodesToReturn;
}

const knownWalkLengths = {};

for (let y = 0; y < allNodes.length; y++) {
    const thisLine = allNodes[y];
    for (let x = 0; x < thisLine.length; x++) {
        if (x === tempCheckCoord.x && y === tempCheckCoord.y) {
            // console.log("About to check for children of temp checking coord");
        }
        allNodes[y][x].children = getNodeschildren(allNodes[y][x]);
        allNodes[y][x].children.forEach(child => {
            child.parents.push(allNodes[y][x]);
        });
    }
}

const calculateWalkCost = (startX, startY, endX, endY) => {
    const allNode = allNodes[startY][startX];

    if (allNode.cost !== -1) {
        return allNode.cost;
    }

    if (startX === endX && startY === endY) {
        return 0;
    }

    const children = allNode.children
        .filter(x => Number.isFinite(x.cost))
        .filter(x => x.cost !== -1);

    if (children.length === 0) {
        return -1;
    }

    if (children.every(x => x.cost === -1)) {
        return -1;
    }

    return Math.min(...children.filter(x => x.cost >= 0).map(x => x.cost)) + 1;
};

const tempPrintingSize = 10;

for (let i = 0; i < 10000; i++) {
    for (let y = 0; y < allNodes.length; y++) {
        const thisLine = allNodes[y];
        for (let x = 0; x < thisLine.length; x++) {
            if (x === tempCheckCoord.x && y === tempCheckCoord.y) {
                // console.log("About to check for children of temp checking coord");
            }
            allNodes[y][x].cost = calculateWalkCost(x, y, endingCoord.x, endingCoord.y)
        }
    }

}
const surroundingEnd = allNodes.slice(endingCoord.y - tempPrintingSize, endingCoord.y + tempPrintingSize)
    .map(line => line.slice(endingCoord.x - tempPrintingSize, endingCoord.x + tempPrintingSize).map(x => x.cost < 0 ? "---" : `${x.cost}`.padStart(3, " ")).join("|")).join("\n")

console.log("=============================")
console.log(surroundingEnd);
console.log("=============================")

// console.log(allNodes.map(line => line.map(x => x.cost).join(" ")).join("\n"))
console.log(allNodes[startingCoord.y][startingCoord.x].cost);
const result = allNodes
    .flatMap(line => line.filter(x => x.v === 'a' && x.cost !== -1))
    .sort((a, b) => a.cost < b.cost ? -1 : 1)[0].cost

console.log(result);
