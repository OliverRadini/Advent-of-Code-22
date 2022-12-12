const { readFileSync } = require("fs");

const range = (start, finish) => Array.from(Array((finish - start) + 1)).map((_, i) => start + i);

let input = readFileSync("./data10", "utf8");

const SCREEN_WIDTH = 40;
const SCREEN_HEIGHT = 6;

const initialState = {
    registers: {
        x: {
            value: 1,
            history: [1]
        }
    },
    cycle: 0,
    signalStrengthMeasures: [],
    screenOutput: range(0, 10000).map(() => ".")
};

const commands = input
    .split("\n")
    .map(line => line.split(" "))
    .map(([c, n]) => n === undefined ? { type: "noop" } : { type: "addx", payload: Number(n) });

const cycleNumberIsSignalStrengthMeasure = x => (x - 20) % 40 === 0;

const measureSignalStrength = (state, register, atCycle) => {
    return state.registers[register].value * atCycle;
};

const reducer = (state, action) => {
    const cycleAfterNextAction = state.cycle + (
        action.type === "addx" ? 2 : 1
    );

    const cyclesCoveredByOperation = range(state.cycle+1, cycleAfterNextAction);

    // if the signal strength measure occurs between now and the next
    // action, then we use current state
    let signalStrengthMeasure = null;
    const cycleForSignalStrenghtMeasure = cyclesCoveredByOperation
        .find(cycleNumberIsSignalStrengthMeasure);
    if (cycleForSignalStrenghtMeasure !== undefined) {
        signalStrengthMeasure = measureSignalStrength(state, "x", cycleForSignalStrenghtMeasure);
    }

    // if the operation spans more than one cycle, we still need to
    // write to the screen for both
    const newScreenOutput = [...state.screenOutput];
    cyclesCoveredByOperation.forEach(cycleNumber => {
        const isLit = cycleNumber === state.registers.x.value
            || cycleNumber === state.registers.x.value + 1
            || cycleNumber === state.registers.x.value - 1;

        if (isLit) {
            console.log(`${cycleNumber} is lit`);
            newScreenOutput[cycleNumber] = "#";
        }
    });

    switch (action.type) {
        case "addx":
            return {
                ...state,
                registers: {
                    ...state.registers,
                    x: {
                        value: state.registers.x.value + action.payload,
                    }
                },
                cycle: cycleAfterNextAction,
                signalStrengthMeasures: signalStrengthMeasure === null
                    ? state.signalStrengthMeasures
                    : [...state.signalStrengthMeasures, signalStrengthMeasure],
                screenOutput: newScreenOutput,
            };
        case "noop":
            return {
                ...state,
                cycle: cycleAfterNextAction,
                signalStrengthMeasures: signalStrengthMeasure === null
                    ? state.signalStrengthMeasures
                    : [...state.signalStrengthMeasures, signalStrengthMeasure],
                screenOutput: newScreenOutput,
            };
        default:
            return state;
    }
};

const endState = commands.reduce((p, c) => reducer(p, c), initialState);

console.log(endState);

let lines = [];

for (let i = 0; i < SCREEN_HEIGHT; i++) {
    lines.push(endState.screenOutput.slice(i, i+SCREEN_WIDTH));
}

console.log(lines.map(x => x.join("")).join("\n"));