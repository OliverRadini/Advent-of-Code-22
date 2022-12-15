import { readFileSync } from "fs";

const letterLookup = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26 };

const filename = process.argv[2] || "./data12_2";

const input = readFileSync(filename, "utf8")
    .split("\n")
    .map(line => line.split(""));

type Coord = {
    x: number;
    y: number;
}

type Node = {
    value: Coord;
    children: Array<Node>;
};

const findValue = (value: string): Coord | null => {
    for (let y = 0; y < input.length; y++) {
        const line = input[y];
        for (let x = 0; x < line.length; x++) {
            if (input[y][x] === value) {
                return { x, y };
            }
        }
    }

    return null;
}

const startingCoord = findValue("S");
const endingCoord = findValue("E");

if (startingCoord === null || endingCoord === null) {
    throw new Error("Can't find start/end");
}

const getValueAt = (at: Coord): string | null => {
    try {
        return input[at.y][at.x];
    } catch (e) {
        return null;
    }
};

const getCoordinatesSurrounding = ({x: xFrom, y: yFrom}: Coord): Array<Coord> => [
    { x: xFrom,  y: yFrom + 1 },
    { x: xFrom, y:  yFrom - 1 },
    { x: xFrom - 1, y:  yFrom },
    { x: xFrom + 1, y:  yFrom },
];

// the data we are talking about is a tree
// so a node has a value, and multiple children
// so for this, a node has a value of its position, and children of (possible) surrounding nodes
// and then a path is just a string of nodes
// a string of nodes is just Node -> Child Node -> Child Node

const coordNodes: Record<string, Node> = {};
const getCoordsNode = (c: Coord): Node | undefined => coordNodes[`${c.x}|${c.y}`];
const addCoordNode = (node: Node) => coordNodes[`${node.value.x}|${node.value.y}`] = node;

const walkIsViable = (from: Coord) => (to: Coord) => {
    const fromValue = getValueAt(from);
    const toValue = getValueAt(to);

    if (fromValue === null || toValue === null) {
        return false;
    }

    return letterLookup[toValue] - letterLookup[fromValue] <= 1
        || fromValue === "S" || toValue === "E";
};

const buildPaths = (from: Coord, finish: Coord, visited: Array<Coord>): Node => {
    console.log(`At (${from.x}, ${from.y})`);
    const existingNode = getCoordsNode(from);
    if (existingNode !== undefined) {
        console.log("Has node already");
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

    const isNotVisited = (c: Coord) => !(visited.some(x => x.x === c.x && x.y === c.y));

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


const nodesAreEqual = (a: Node, b: Node) => a.value.x === b.value.x &&
    a.value.y === b.value.y

const getRouteBetween = (startNode: Node, endNode: Node) => {
    if (startNode.children.length === 0) {
        return [[null]];
    }

    if (nodesAreEqual(startNode, endNode)) {
        return [];
    }

    const isNexttoEnd = startNode.children.some(x => nodesAreEqual(x, endNode));
    if (isNexttoEnd) {
        return [[startNode, endNode]];
    }

    const childWalks = startNode.children
        .map(childNode => [startNode, ...getRouteBetween(childNode, endNode)]);
    return childWalks;
};

console.log(getRouteBetween(startingNode, { value: endingCoord, children: [] }));