const { writeFileSync, readFileSync } = require("fs");

const filePath = process.argv[2] || "./data16";

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

const links = valves.reduce((p, c) => ({
    ...p,
    [c.id]: valves.reduce((p1, c1) => ({
        ...p1,
        [c1.id]: c.tunnels.find(t => t === c1.id) !== undefined
    }), {})
}), {});

const rates = valves.reduce((p, c) => ({
    ...p,
    [c.id]: c.flowRate
}), {});

const valveOpenState = valves.reduce((P, c) => ({ ...P, [c.id]: false }), {})

let paths = {}
try {
    paths = JSON.parse(readFileSync("./paths_cache", "utf8"));
} catch {
    paths = valves.reduce((p1, c1, i) => {
        console.log(`${i}/${valves.length}`);
        return {
            ...p1,
            [c1.id]: valves.filter(v => v.flowRate !== 0).reduce((p2, c2) => ({
                ...p2,
                [c2.id]: getShortestPathBetween(c1.id, c2.id, {})
            }), {})
        };
    }, {})
}

writeFileSync("./paths_cache", JSON.stringify(paths));

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

const closedValves = () => Object.keys(valveOpenState).filter(k => !valveOpenState[k])

function getValveValue(from , to, timeRemaining, theseRates) {
    const pathToTake = from === to ? [] : paths[from][to];

    if (pathToTake === undefined) {
        return 0;
    }

    const pathCost = pathToTake.length;

    const amountOfTimeValveWillBeOpen = timeRemaining - pathCost - 1;
    return (amountOfTimeValveWillBeOpen * theseRates[to]);
}

function allCombinationsOf(xs) {
    if (xs.length === 2) {
        return [[xs[0], xs[1]], [xs[1], xs[0]]];
    }
    return xs.flatMap(x => allCombinationsOf(xs.filter(y => y !== x)).map(y => [x, ...y]));
}


let timeRemaining = 30;
const currentNode = "AA";

const evaluateWalkValue = (start, walk, timeRemaining, rates, openStates) => {
    let currentTimeRemaining = timeRemaining;
    const theseOpenStates = {...openStates};
    const thisWalk = [start, ...walk];

    let totalPressureRelease = 0;

    for (let i = 0; i < thisWalk.length - 1; i++) {
        const from = thisWalk[i];
        const to = thisWalk[i + 1]

        currentTimeRemaining -= (paths[from][to].length  - 1);

        theseOpenStates[to] = true;
        currentTimeRemaining -= 1;

        if (currentTimeRemaining < 0) {
            return totalPressureRelease;
        }

        totalPressureRelease += currentTimeRemaining * rates[to];

        if (totalPressureRelease < 0) {
            throw new Error("Walk value cannot be below 0");
        }
    }


    return totalPressureRelease;
};

function arrayMove(array, fromIndex, toIndex) {
    const clone = [...array];
    const element = clone[fromIndex];
    clone.splice(fromIndex, 1);
    clone.splice(toIndex, 0, element);
    return clone;
}

let totalPressureRelease = 0;
let visitedNodes = ["AA"]

let bestKnownWalk = [[], 0];
while(true) {
    console.log(bestKnownWalk);
    if (timeRemaining < 0) {
        break;
    }

    console.log("Getting combinations...");
    const bestNodes = closedValves()
        .filter(v => rates[v] > 0)
        .map(valve => [valve, getValveValue(currentNode, valve, timeRemaining, rates)])
        .sort((a, b) => a[1] < b[1] ? 1 : -1)
        .slice(0, 10)
        .map(x => x[0]);

    const combinations = allCombinationsOf(bestNodes)
        .map(xs => xs.slice(0, 6));

    console.log("Evaluating combinations...");
    let bestWalk = [[], 0]
    for (let i = 0; i < combinations.length; i++) {
        const result = evaluateWalkValue(currentNode, combinations[i], timeRemaining, rates, valveOpenState);
        if (result > bestWalk[1]) {
            bestWalk = [combinations[i], result];
        }
    }

    if (bestWalk[1] > bestKnownWalk[1]) {
        bestKnownWalk = bestWalk;
    }

    if (bestWalk === undefined || bestWalk[0] === undefined) {
        break;
    }

    // const sortedWalks = possibleWalks.sort((a, b) => a[1] > b[1] ? -1 : 1);
    // sortedWalks.forEach(walk => {
    //     console.log(`
    //                    Walk: ${walk[0].join(", ")}
    //         Estimated Value: ${walk[1]}
    //     `);
    // })
    // const bestWalk = sortedWalks[0];
    const nextNode = bestWalk[0][0];
    console.log(`Next node is ${nextNode}`);
    visitedNodes.push(nextNode);
    timeRemaining -= paths[currentNode][nextNode].length;
    valveOpenState[nextNode] = true;
    timeRemaining -= 1;
    totalPressureRelease += rates[nextNode] * timeRemaining;
}

console.log(visitedNodes);
console.log(totalPressureRelease);
console.log(bestKnownWalk);