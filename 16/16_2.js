const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data16";

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
        return {
            isOpen: false,
            id,
            flowRate: Number(flowRate),
            tunnels: tunnelsRaw.split(", ")
        };
    });

const numberOfValves = valves.length;

const maxForBase = parseInt(numberOfValves, numberOfValves);

console.log(numberOfValves);
console.log(maxForBase);