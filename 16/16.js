const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data16_2";

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
            tunnels: tunnelsRaw.split(", "),
            isOpen: false
        };
    });

const valvesLookup = {};
for (let i = 0; i < valves.length; i++) {
    const thisValve = valves[i];
    valvesLookup[thisValve.id] = thisValve;

    thisValve.links = thisValve
        .tunnels
        .map(t => {
            return valves.find(v => v.id === t.replace("\r", ""));
        });
}

const getValveWithId = id => valvesLookup[id];

const initialValve = getValveWithId("AA");

const walkCache = {};

const addCache = (idA, idB, walk) => {
    if (walkCache[idA] === undefined) {
        walkCache[idA] = {};
    }

    if (walkCache[idA][idB] === undefined) {
        walkCache[idA][idB] = {};
    }

    walkCache[idA][idB] = walk;
};

const getShortestPathBetweenNodes = (idA, idB, currentPath=[]) => {
    // if (walkCache[idA] && walkCache[idA][idB] !== undefined) {
    //     console.log(`
    //         ${idA} -> ${idB} = ${walkCache[idA][idB]} (cached)
    //         With current path: ${currentPath}
    //     `);
    //     return walkCache[idA][idB];
    // }

    if (currentPath.some(id => id === idA)) {
        return null;
    }

    const nodeA = getValveWithId(idA);

    if (nodeA === undefined) {
        console.log("THIS IS AN ERROR");
    }

    if (nodeA.links.some(l => l.id === idB)) {
        const result = [...currentPath, idA, idB];
        addCache(idA, idB, result);
        return result;
    }

    const pathsFromLinks = nodeA.links
        .map(link => {
            const shortestPath = getShortestPathBetweenNodes(
                link.id,
                idB,
                [...currentPath, idA]
            );
            return shortestPath;
        })
        .filter(x => x !== null);

    if (pathsFromLinks.length === 0) {
        addCache(idA, idB, null);
        return null;
    }

    const shortestPath = pathsFromLinks.sort(
        (a, b) => a.length < b.length
             ? -1 : 1
    )[0];

    addCache(idA, idB, shortestPath);


    // console.log(`
    //     ${idA} -> ${idB} = ${shortestPath}
    //     With current path: ${currentPath}
    // `);

    return shortestPath;
};

// const test = getShortestPathBetweenNodes("DD", "JJ");
// console.log(test);

function getNodeValuesWithTimeRemaining(from, timeRemaining) {
    const nodeValues = [];

    if (timeRemaining === 27) {
        console.log("TEST");
    }

    for (let i = 0; i < valves.length; i++) {
        const shortestPath = getShortestPathBetweenNodes(
            from,
            valves[i].id
        );

        if (shortestPath === null) {
            continue;
        }

        const distanceToThisNode = shortestPath.length;

        const thisNodeValue = valves[i].isOpen
            ? 0
            : (valves[i].flowRate * (timeRemaining - 1 - distanceToThisNode)) / (distanceToThisNode);

        nodeValues.push([valves[i].id, thisNodeValue]);
    }

    return nodeValues.sort((a, b) => a[1] < b[1] ? 1 : -1);
}

let pressureReleased = 0;
let currentValve = initialValve;
let currentWalk = [];
const visitedNodes = [];

for (let i = 0; i < 30; i++) {
    console.log(` == Minute ${i + 1}`);
    console.log(`Valves ${valves.filter(v => v.isOpen).map(v => v.id).join(", ")} are open releasing ${valves.reduce((p, c) => c.isOpen ? p + c.flowRate : p, 0)} pressure`);
    for (let j = 0; j < valves.length; j++) {
        if (valves[j].isOpen) {
            pressureReleased += valves[j].flowRate;
        }
    }
    visitedNodes.push(currentValve.id);
    let hasOpened = false;
    
    if (currentWalk.length === 0 && !currentValve.isOpen && currentValve.flowRate !== 0) {
        currentValve.isOpen = true;
        visitedNodes.push("OPEN");
        console.log(`You open valve ${currentValve.id}`)
        hasOpened = true;
    }

    if (currentWalk.length === 0) {
        const nodeValues = getNodeValuesWithTimeRemaining(currentValve.id, 30 - i);

        const mostValuableNode = nodeValues[0];

        if (mostValuableNode === null || mostValuableNode === undefined) {
            console.log(currentWalk);
        }

        try {
            const shortestPath = getShortestPathBetweenNodes(currentValve.id, mostValuableNode[0]).slice(1);
            currentWalk = shortestPath;
        } catch (err) {
            console.log(err);
        }
    }

    if (!hasOpened) {
        console.log(`You move to valve ${currentWalk[0]}`);
        currentValve = getValveWithId(currentWalk[0]);
    }
    currentWalk = currentWalk.slice(1);

}

console.log(visitedNodes);
console.log(pressureReleased)