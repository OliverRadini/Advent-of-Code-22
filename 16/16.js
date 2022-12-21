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
        return { id, flowRate: Number(flowRate), tunnels: tunnelsRaw.split(", ") };
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
 * 
 * This is a difficult problem because:
 *     - The best route between two nodes may change once a valve is changed
 *     - So you don't seem to have much choice but to recompute this every time
 *     - Though we _can_ say that changing a valve can only affect routes where that
 *       valve appears
 *     - In which case, maybe keep a cache of all paths which contain a given valve
 *       and then adjust those when a valve is changed
 * 
 * Maybe at first we need to cache all possible routes, rather than best/shortest?
 *     - Because we need to know which routes are possible at a given time
 *       because it's possible that the all change completely
 * 
 * Is it possible to describe this problem as an evaluation as all possible paths
 * from a node before it repeats itself?
 *     - Maybe... why is the repeating significant?
 *     - You'd think it might be... but then that makes more sense on a graph
 *       where the weights aren't changing over time
 *     - A mathematical formulation of such a graph seems quite difficult... as you
 *       would need to keep track of so many variables
 * 
 * Is a brute force solution in any way realistic? You'd hvae to determine,
 * on every move, the new optimums for the entire graph. To determine the optimum
 * seems almost impossible; how do you know whether you would, once turning on the
 * first valve, be better off returning to the initial node or not? A -> B -> A -> D
 * may be more valuable, for instance, than A -> B -> C -> F. Determining which is most
 * valuable is essentially going to mean calculating every possible route.
 * 
 * Could we try and represent all of the possible routes as strings? See how many
 * there are
 */
const getShortestPathBetweenNodes = (idA, idB, currentPath=[]) => {
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

// note: currently working under circumstance that you always turn the valve
//       on and so every walk has the same time (2 minutes)
const caches = {};

const addCache = (id, timeRemaining, result) => {
    if (caches[id] === undefined) {
        caches[id] = {};
    }

    caches[id][timeRemaining] = result;
}
const containsLessThanNDuplicates = n => nodes => {
    const nodeTypeCounts = {};
    for (let i = 0; i < nodes.length; i++) {
        const thisNode = nodes[i];

        if (nodeTypeCounts[thisNode] === undefined) {
            nodeTypeCounts[thisNode] = 0;
        }

        nodeTypeCounts[thisNode] += 1;
    }

    return Object.values(nodeTypeCounts).every(x => x < n);
};

const walkCost = 2;
// this is almost certainly not going to work - it would take far too long
// as there are far too many possible walks
const getPossibleWalksFromNodeWithTimeRemaining = (id, timeRemaining) => {
    if (id === "AA" && timeRemaining === 30) {
        console.log("yes");
    }
    if (caches[id] !== undefined && caches[id][timeRemaining] !== undefined) {
        return caches[id][timeRemaining];
    }

    // note: this maybe shouldn't happen, as it won't
    //       call this (hopefully) with this little time remaining
    if (timeRemaining <= 1) {
        return [];
    }

    const node = getValveWithId(id);

    if (timeRemaining < (2 * walkCost)) {
        const result = node.tunnels.map(t => [id, t]);
        addCache(id, timeRemaining, result);
        return result;
    }

    const walks = node.tunnels.flatMap(t => getPossibleWalksFromNodeWithTimeRemaining(
        t, timeRemaining - walkCost
    ))
        .map(walk => [id, ...walk])
        .filter(containsLessThanNDuplicates(10));


    addCache(id, timeRemaining, walks);
    caches[id][timeRemaining] = walks;
    return walks;
};

const result = getPossibleWalksFromNodeWithTimeRemaining("AA", 30, [])
    // .map(x => x.join("|"))
    // .reduce(
    //     (nonDuplicateWalks, currentWalk) => {
    //         if (nonDuplicateWalks.has(currentWalk)) {
    //             return nonDuplicateWalks;
    //         }

    //         nonDuplicateWalks.add(currentWalk);
    //         return nonDuplicateWalks;
    //     },
    //     new Set()
    // );

console.log(result.length)

const myNewValves = valves.map(v => ({...v, isOpen: false})).reduce(
    (p, c) => ({
        ...p,
        [c.id]: c
    }), {}
);

const calculateCostOfWalk = walk => {
    let theseValves = {...myNewValves};

    let pressureReleased = 0;
    for (let i = 0; i < walk.length; i++) {
        myNewValves[walk[i]].isOpen = true;
        pressureReleased = Object.values(theseValves)
            .reduce(
                (p, c) => c.isOpen ? p + c.flowRate : 0,
                pressureReleased
            )
    }

    theseValves = null;
    // console.log(`${walk.join(",")}: ${pressureReleased}`);
    return [walk, pressureReleased];
}

console.log(result.map(calculateCostOfWalk).sort((a, b) => a[1] < b[1] ? 1 : -1));