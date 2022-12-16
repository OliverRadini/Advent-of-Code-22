const { readFileSync } = require("fs");

const letterLookup = { S: 1, E: 26, a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26 };
const filename = process.argv[2] || "./data12";
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

const getCoordinatesSurrounding = ({ x: xFrom, y: yFrom }) => [
    { x: xFrom, y: yFrom + 1 },
    { x: xFrom, y: yFrom - 1 },
    { x: xFrom - 1, y: yFrom },
    { x: xFrom + 1, y: yFrom },
]
    .filter(c => {
        try {
            const isGreaterThanZero = c.x >= 0 && c.y >= 0;

            if (!isGreaterThanZero) {
                return false;
            }
            
            const isWithinBounds = c.y < HEIGHT && c.x < input[c.y].length;

            return isWithinBounds;
        } catch (error) {
            console.log(`Error finding coordinate (${c.x}, ${c.y})`);
            return false;
        }
    });

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
    return getCoordinatesSurrounding(node)
        .map(getAllNodeAtCoord)
        .filter(coord => coord && walkIsViable(node.v)(coord.v))
}

const knownWalkLengths = {};

for (let y = 0; y < allNodes.length; y++) {
    const thisLine = allNodes[y];
    for (let x = 0; x < thisLine.length; x++) {
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
        .filter(x => x.cost !== -1)
        .filter(x => x.cost !== -7);

    if (children.length === 0) {
        return -7;
    }

    if (children.every(x => x.cost === -1)) {
        return -2;
    }

    return Math.min(...children.map(x => x.cost)) + 1;
};

const tempPrintingSize = 20;

for (let i = 0; i < 10000; i++) {
    for (let y = 0; y < allNodes.length; y++) {
        const thisLine = allNodes[y];
        for (let x = 0; x < thisLine.length; x++) {
            allNodes[y][x].cost = calculateWalkCost(x, y, endingCoord.x, endingCoord.y)
        }
    }

}
    const surroundingEnd = allNodes.slice(endingCoord.y - tempPrintingSize, endingCoord.y + tempPrintingSize)
        .map(line => line.slice(endingCoord.x - tempPrintingSize, endingCoord.x + tempPrintingSize).map(x => x.cost < 0 ? "-" : x.cost).join("|")).join("\n")

    console.log("=============================")
    console.log(surroundingEnd);
    console.log("=============================")

// console.log(allNodes.map(line => line.map(x => x.cost).join(" ")).join("\n"))
console.log(allNodes[startingCoord.y][startingCoord.x].cost);
