const { writeFileSync, readFileSync } = require("fs");

const filePath = process.argv[2] || "./test1";

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
                [c2.id]: getShortestPathBetween(c1.id, c2.id, {}).length - 1
            }), {})
        };
    }, {})
}

writeFileSync("./paths_cache", JSON.stringify(paths));


const cache = {};

/**
 * 
 * @param {string} from node id to start from
 * @param {number} timeRemaining  how much time is remaining
 * @param {object} openNodes which nodes are open, key is valve id, value is whether it's open
 * @returns a list of nodes representing the possible paths
 */
function bestWalkFromXWithTimeRemaining (from, timeRemaining, openNodes) {
    const key = `${from}||${timeRemaining}||${JSON.stringify(openNodes)}`;
    
    // do we already know what this is? If so, use it
    if (cache[key] !== undefined) {
        return cache[key];
    }

    // with only one minute remaining, it's not possible to affect the
    // amount of pressure released
    if (timeRemaining <= 1) {
        cache[key] = 0;
        return 0;
    }

    const shouldOpenValve = rates[from] > 0 && !openNodes[from];

    const timeRemainingAfterOpeningValve = shouldOpenValve
        ? timeRemaining - 1
        : timeRemaining;

    const reachableClosedNodes = Object.keys(paths[from])
        .filter(to => !openNodes[to] && paths[from][to] <= timeRemainingAfterOpeningValve);

    if (reachableClosedNodes.length === 0) {
        cache[key] = 0;
        return 0;
    }

    const pressureReleasedFromOpeningThisValve = timeRemainingAfterOpeningValve * rates[from];

    const allPathValues = reachableClosedNodes
        .map(to => bestWalkFromXWithTimeRemaining(
                to,
                timeRemainingAfterOpeningValve - (paths[from][to]),
                { ...openNodes, [from]: shouldOpenValve || openNodes[from] }
            
        ));

    const result = pressureReleasedFromOpeningThisValve + allPathValues
        .reduce(
            (p, c) => c > p ? c : p,
            0,
        );

    cache[key] = result;
    
    return result;
};

const allValvesClosed = valves.reduce((p, c) => ({ ...p, [c.id]: false }), {});
const result = bestWalkFromXWithTimeRemaining("AA", 30, allValvesClosed);
console.log(result);


/**
 * 
 * What is going wrong?
 *   - The path is wrong?
 *   - The number is 21 short
 *     - This could be any number of things
 * 
 * 
 * What is not going wrong?
 *   - The shortest paths are all correct
 *   - The logic is at least close, as the example is correct
 *   - 
 */