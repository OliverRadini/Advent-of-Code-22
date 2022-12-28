const { writeFileSync, readFileSync } = require("fs");

const filePath = process.argv[2] || "./data16_2";

/**
 * Valves is the data for all valves, and has raw data on
 * tunnels, flow rate, and id
 */
const valves = readFileSync(filePath, "utf8")
    .split("\n")
    .map(line => line
        .replace("Valve ", "")
        .replace(" has flow rate=", "|")
        .replace(/; tunnels? leads? to valves? /g, "|")
    )
    .map(line => {
        const [id, flowRate, tunnelsRaw] = line.split("|");
        return {
            id,
            flowRate: Number(flowRate),
            tunnels: tunnelsRaw.split(", ").map(x => x.replace("\r", ""))
        };
    });

// links just maps which nodes are connected to which other nodes
const links = valves.reduce((p, c) => ({
    ...p,
    [c.id]: valves.reduce((p1, c1) => ({
        ...p1,
        [c1.id]: c.tunnels.find(t => t === c1.id) !== undefined
    }), {})
}), {});

// Rates is just the flow rate for each node, valve id: flow rate
const rates = valves.reduce((p, c) => ({
    ...p,
    [c.id]: c.flowRate
}), {});


function getShortestPathBetween(from, to, alreadyVisited) {
    if (paths && paths[from] && paths[from][to] !== undefined) {
        return paths[from][to];
    }
    if (alreadyVisited[from]) {
        return null;
    }

    if (links[from][to]){
        return [from, to];
    }

    if (alreadyVisited[from]) {
        return null;
    }

    const possibleLinks = Object.keys(links[from]).filter(k => links[from][k]);

    const nextRoutes = possibleLinks
        .map(l => getShortestPathBetween(l, to, { ...alreadyVisited, [from]: true }))
        .filter(x => x !== null);

    if (nextRoutes.length === 0) {
        return null;
    }
    
    const shortestRoute = nextRoutes
        .sort((a, b) => a.length < b.length ? -1 : 1)[0];

    return [from, ...shortestRoute];
}

/**
 * 
 * Paths has { valve id: { valve id: distance } }
 * 
 * It will only include nodes that are AA or flow rate over 0.
 * It won't have distances to the same node.
 * 
 */
let paths = {}
try {
    paths = JSON.parse(readFileSync("./paths_cache", "utf8"));
} catch {
    paths = valves.filter(x => x.flowRate > 0 || x.id === "AA").reduce((p1, c1, i) => {
        console.log(`${i}/${valves.length}`);
        return {
            ...p1,
            [c1.id]: valves.filter(v => v.id !== c1.id).filter(v => (v.flowRate > 0 || v.id === "AA")).reduce((p2, c2) => ({
                ...p2,
                [c2.id]: getShortestPathBetween(c1.id, c2.id, {}).length
            }), {})
        };
    }, {})
}

writeFileSync("./paths_cache", JSON.stringify(paths));


/**
 * 
 * @param {string} from node id to start from
 * @param {number} timeRemaining  how much time is remaining
 * @returns a list of nodes representing the possible paths
 */
function allPathsFromXWithTimeRemaining (from, timeRemaining) {
    if (timeRemaining <= 1) {
        console.log(`At ${from} with ${timeRemaining} minute(s) remaining. No reachable nodes`);
        return [[from]];
    }

    const reachableNodes = Object.keys(paths[from])
        .filter(to => paths[from][to] < timeRemaining - 1);

    if (reachableNodes.length === 0) {
        return [[from]];
    }

    const timeRemainingAfterOpeningValve = timeRemaining - 1;

    return reachableNodes
        .flatMap(to => {
            const allPathsFromThisNode = allPathsFromXWithTimeRemaining(
                to,
                timeRemainingAfterOpeningValve - (paths[from][to])
            );

            return allPathsFromThisNode
                .map(path => [from, ...path]);
        });
};

const test = allPathsFromXWithTimeRemaining("AA", 10);
console.log(test);