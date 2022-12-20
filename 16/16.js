const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data16_2";

// Valve JZ has flow rate=0; tunnels lead to valves IR, LY
const valves = readFileSync(filePath, "utf8")
    .split("\n")
    .map(line => line
        .replace("Valve ", "")
        .replace(" has flow rate=", "|")
        .replace(/; tunnels? leads? to valves? /g, "|")
    )
    .map(line => {
        const [id, flowRate, tunnelsRaw] = line.split("|");
        return { id, flowRate, tunnels: tunnelsRaw.split(", ") };
    })

const valvesLookup = {};
for (let i = 0; i < valves.length; i++) {
    const thisValve = valves[i];
    valvesLookup[thisValve.id] = thisValve;

    thisValve.links = thisValve.tunnels.map(t => valves.find(v => v.id === t));
}

const getValveWithId = id => valvesLookup[id];

const initialValve = getValveWithId("AA");

/**
 * Could we try:
 *     - for each node, get the distance to each other node
 *           - and note the shortest path
 *     - walk the tree, each time we move a node check that we are always moving
 *       in the optimum direction
 *     - so when we're at a node, look at each node and determine, we have to walk
 *       how far, how much pressure will be released total by the time we reach that
 *       valve
 */
// TODO: cache these so we always know the best path A -> B
const getShortestPathBetweenNodes = (idA, idB, currentPath=[]) => {
    console.log(`
        ${idA} -> ${idB} 
    `);

    if (idA === "DD") {
        console.log("hyw");
    }

    if (currentPath.some(id => id === idA)) {
        return null;
    }

    const nodeA = getValveWithId(idA);


    if (nodeA.links.some(l => l.id === idB)) {
        return [...currentPath, idA, idB];
    }

    const pathsFromLinks = nodeA.links
        .map(link => getShortestPathBetweenNodes(link.id, idB, [...currentPath, idA]))
        .filter(x => x !== null);


    if (pathsFromLinks.length === 0) {
        return null;
    }

    const shortestPath = pathsFromLinks.sort(
        (a, b) => a.length < b.length
             ? -1 : 1
    )[0];

    return shortestPath;
};

const testThing = getShortestPathBetweenNodes("JZ", "SI");


console.log(testThing);
// console.log(valves);