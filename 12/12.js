const { readFileSync } = require("fs");

const letterLookup = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26 };
const filename = process.argv[2] || "./data12";
const input = readFileSync(filename, "utf8")
    .split("\n")
    .map(line => line.split(""));

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
];


// the data we are talking about is a tree
// so a node has a value, and multiple children
// so for this, a node has a value of its position, and children of (possible) surrounding nodes
// and then a path is just a string of nodes
// a string of nodes is just Node -> Child Node -> Child Node
const coordNodes = {};
const getCoordsNode = (c) => coordNodes[`${c.x}|${c.y}`];
const addCoordNode = (node) => coordNodes[`${node.value.x}|${node.value.y}`] = node;

const walkIsViable = (from) => (to) => {
    const fromValue = getValueAt(from);
    const toValue = getValueAt(to);
    if (fromValue === null || toValue === null) {
        return false;
    }
    return letterLookup[toValue] - letterLookup[fromValue] <= 1
        || fromValue === "S" || toValue === "E";
};

console.log(getCoordinatesSurrounding({ x: 0, y: 7 }).filter(x => walkIsViable({ x: 0, y: 7})(x)));

const buildPaths = (from, finish, visited) => {
    const existingNode = getCoordsNode(from);
    if (existingNode !== undefined) {
        return existingNode;
    }
    if (from.x === finish.x && from.y === finish.y) {
        console.log("FOUND THE END!");
        return {
            value: from,
            children: []
        };
    }
    const isViable = walkIsViable(from);
    const isNotVisited = (c) => !(visited.some(x => x.x === c.x && x.y === c.y));
    const node = {
        value: from,
        children: getCoordinatesSurrounding(from)
            .filter(isViable)
            .filter(isNotVisited)
            .map(coord => buildPaths(coord, finish, [...visited, from]))
    };
    addCoordNode(node);
    return node;
};

const startingNode = buildPaths(startingCoord, endingCoord, []);
const nodesAreEqual = (a, b) => a.value.x === b.value.x &&
    a.value.y === b.value.y;

const minimumRouteCache = {

};
const calculateMinimumRoute = (from, target) => {
    if (from === undefined || target === undefined) {
        console.log("UH OH");
    }
    const thisCacheKey = `(${from.value.x}, ${from.value.y})`;
    if (minimumRouteCache[thisCacheKey] !== undefined) {
        return minimumRouteCache[thisCacheKey];
    }

    if (nodesAreEqual(from, target)) {
        minimumRouteCache[thisCacheKey] = 0;
        return 0;
    }

    const childSizes = from.children.map(child => calculateMinimumRoute(child, target));

    if (childSizes.some(x => !Number.isFinite(x))) {
        console.log("infinity?");
    }

    const result = Math.min(...childSizes) + 1;
    minimumRouteCache[thisCacheKey] = result;
    console.log(`registering result for ${thisCacheKey}`);
    return result;
}

const endNode = {
    value: endingCoord,
    children: []
};

const pathSizeGrid = input.map(line => line);

for (let y = 0; y < input.length; y++) {
    const thisLine = input[y];
    for (let x = 0; x < thisLine.length; x++) {
        const fromNode = getCoordsNode({ x, y });
        if (!fromNode) {
            continue;
        }
        const thisPathSize = calculateMinimumRoute(fromNode, endNode);
        pathSizeGrid[y][x] = thisPathSize;
    }
}

const tempOutput = pathSizeGrid.map(line => line.join("")).join("\n");
console.log(tempOutput);


console.log("Has all nodes");
console.log("Calculating result");
const result = calculateMinimumRoute(startingNode, endNode);
console.log(result);