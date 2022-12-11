const { readFileSync } = require("fs");

const parseInputToActions = input => input
    .split("\n")
    .map(line => line.split(" "))
    .map(([dir, n]) => Array.from(Array(Number(n))).map(() => ({ type: dir })))
    .flat();

const initialState = {
    tailX: 0,
    tailY: 0,
    headX: 0,
    headY: 0,
};

const pointComparison = (a, b) => {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
}

const moveTail = (state) => {
    if (
        Math.abs(state.headX - state.tailX) <= 1
        && Math.abs(state.headY - state.tailY)  <= 1
    ) {
        return state;
    }

    const tailXDirection = pointComparison(state.headX, state.tailX);
    const tailYDirection = pointComparison(state.headY, state.tailY);

    return {
        ...state,
        tailX: state.tailX + tailXDirection,
        tailY: state.tailY + tailYDirection,
    };
};

const movementReducer = (state, action) => {
    switch (action.type) {
        case "U":
            return { ...state, headY: state.headY + 1 };
        case "D":
            return { ...state, headY: state.headY - 1 };
        case "L":
            return { ...state, headX: state.headX - 1 };
        case "R":
            return { ...state, headX: state.headX + 1 };
        case "TAIL":
            return moveTail(state);
        default:
            return initialState;
    }
};

const printGrid = (size, state) => {
    for (let y = 0; y < size; y++) {
        let line = "";
        for (let x = 0; x < size; x++) {
            const isHeadMatch = x === state.headX && y === state.headY;
            const isTailMatch = x === state.tailX && y === state.tailY;
            const symbol = isHeadMatch ? "H" : isTailMatch ? "T" : ".";
            line = `${line}${symbol}`;
        }
        console.log(line);
    }
};


let data = readFileSync("./data9", "utf8");

const actions = parseInputToActions(data);

const visitedPoints = {};
let state = initialState;
for (let i = 0; i < actions.length; i++) {
    state = movementReducer(state, actions[i]);
    visitedPoints[`${state.tailX}|${state.tailY}`] = true;
    state = movementReducer(state, { type: "TAIL" });
    visitedPoints[`${state.tailX}|${state.tailY}`] = true;
}

const result = Object.keys(visitedPoints).length;

console.log(result);
