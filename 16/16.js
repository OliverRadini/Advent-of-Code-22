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

let paths = {};
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

console.log(paths["FF"]["CC"]);
console.log(result);