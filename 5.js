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

const mapValues = f => o => Object.keys(o).reduce(
    (p, c) => ({
        ...p,
        [c]: f(o[c]),
    }),
    {}
);

const isMove = s => s[0] === "m";

const parseInputFile = raw => groupBy(x => isMove(x) ? "move" : "stack")(raw.split("\n"));

const parseRawMove = move => {
    const [_, amount, start, finish] = /(\d+).+(\d+).+(\d+)/.exec(move);
    return {amount, start, finish};
};

const COLUMN_SIZE = 4;
const DATA_INDEX = 1;
const EMPTY_SPACE = "-";
const parseRawStackLine = rawLine => Array.from(rawLine)
    .reduce(
        (p, c, i) => {
            const columnPart = i % COLUMN_SIZE;
            const isData = columnPart === DATA_INDEX;

            if (isData) {
                p.push(c === " " ? EMPTY_SPACE : c)
            }
            return p;
        },
        []
    )
    .map((x, i) => ({ col: i, item: x }));

const parseRawStack = raws => mapValues(x => x.map(y => y.item).filter(x => x !== EMPTY_SPACE))(
    groupBy(x => x.col)(
        raws
            .map(parseRawStackLine)
            .filter(x => x.length > 0)
            .slice(0, -1)
            .flat()
    )
);

const applyMove = (s, m) => {
     // TODO: implement this
};

readFile("./data5", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    const { move: rawMoves, stack: rawStack } = parseInputFile(data);

    const parsedMoves = rawMoves.map(parseRawMove);
    const parsedStack = parseRawStack(rawStack);
    console.log(parsedStack);
});
