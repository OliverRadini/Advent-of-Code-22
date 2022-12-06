const { assert } = require("console");
const { readFile } = require("fs");

const groupBy = f => xs => xs
    .reduce(
        (p, c) => {
            const x = f(c);
            if (p.hasOwnProperty(x)) {
                p[x].push(c);
                return p;
            }

            Object.assign(p, { [x]: [c] });
            return p;
        },
        {}
    );

const isMove = s => s[0] === "m";

const parseInputFile = raw => groupBy(x => isMove(x) ? "move" : "stack")(raw.split("\n"));

const parseRawMove = move => {
    const [_, amount, start, finish] = /(\d+).+(\d+).+(\d+)/.exec(move);
    return {amount: Number(amount), start: Number(start), finish: Number(finish) };
};

const applyMove = (s, { amount, start, finish }) => {
    const itemsToAdd = s[start].slice(-amount);
    const newState = {
        ...s,
        [start]: s[start].slice(0, -amount),
        [finish]: [...s[finish], ...itemsToAdd]
    };
    const currentSize = Object.keys(s).map(k => s[k].length).reduce((p, c) => p + c, 0)
    const newSize = Object.keys(newState).map(k => newState[k].length).reduce((p, c) => p + c, 0)

    assert(currentSize === newSize);

    return newState;
};

const parseRawStack = rawStack => {
    const width = rawStack.reduce((p, c) => c.length > p ? c.length : p, 0);

    const result = Array.from(Array(width))
        .map((_, i) => rawStack.map(x => x[i]))
        .map(stack => stack.filter(x => !/[\[\] ]/g.test(x)).filter(x => x !== undefined))
        .filter(x => x.length > 0)
        .map(x => x.reverse())
        .reduce(
            (p, c) => ({
                ...p,
                [c[0]]: c.slice(1)
            }),
            {}
        )

    return result;
};

readFile("./data5", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    const { move: rawMoves, stack: rawStack } = parseInputFile(data);

    const parsedMoves = rawMoves.map(parseRawMove);
    let parsedStack = parseRawStack(rawStack);

    const rearrangedStack = parsedMoves
        .reduce(
            (p, c) => applyMove(p, c),
            parsedStack,
        );

    console.log(Object.values(rearrangedStack).map(x => x[x.length - 1]).join(""));
});
