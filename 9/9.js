const { readFileSync } = require("fs");

const TAIL_COUNT = 9;

const parseInputToActions = input => input
    .split("\n")
    .map(line => line.split(" "))
    .map(([dir, n]) => Array.from(Array(Number(n))).map(() => ({ type: dir })))
    .flat();

const movementReducer = (state, action) => {
    const clone = [...state];
    switch (action.type) {
        case "U":
            clone[0] = [state[0][0], state[0][1] - 1];
            return clone;
        case "D":
            clone[0] = [state[0][0], state[0][1] + 1];
            return clone;
        case "L":
            clone[0] = [state[0][0] + 1, state[0][1]];
            return clone;
        case "R":
            clone[0] = [state[0][0] - 1, state[0][1]];
            return clone;
        case "TAIL":
            return moveTail(state, action.payload);
        default:
            return initialState;
    }
};

const initialState = Array.from(Array(TAIL_COUNT + 1)).map(() => [0, 0]);

const pointComparison = (a, b) => {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
}

const moveTail = (state, tailNumber) => {
    if (tailNumber === 0) {
        throw new Error("Cannot move head via moveTail function");
    }

    const [pX, pY] = state[tailNumber];
    const [hX, hY] = state[tailNumber - 1];

    if (
        Math.abs(hX - pX) <= 1
        && Math.abs(hY - pY)  <= 1
    ) {
        return state;
    }

    const tailXDirection = pointComparison(hX, pX);
    const tailYDirection = pointComparison(hY, pY);

    const pointsClone = [...state];
    pointsClone[tailNumber] = [pX + tailXDirection, pY + tailYDirection];

    return pointsClone;
};


const printGrid = (size, state) => {
    for (let y = 0; y < size; y++) {
        let line = "";
        for (let x = 0; x < size; x++) {
            let matchingIndex = null;
            state.forEach(([pX, pY], i) => {
                if (pX === x && pY === y) {
                    matchingIndex = i;
                }
            });
            const symbol = matchingIndex === null ? "-" : `${matchingIndex}`;
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
    for (let a = 1; a < state.length; a++) {
        state = movementReducer(state, { type: "TAIL", payload: a });
    }
    const [tX, tY] = state[state.length - 1];
    visitedPoints[`${tX}|${tY}`] = true;
}

const result = Object.keys(visitedPoints).length;

console.log(result);
