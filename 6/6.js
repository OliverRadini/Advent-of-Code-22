const { readFile } = require("fs");

const take = n => xs => xs.slice(0, n);

const arrayContainsDuplicates = xs => xs.reduce(
    ([hasMatchAlready, cache], c) => {
        if (hasMatchAlready || cache.has(c)) {
            return [true, cache];
        }
        cache.add(c);
        return [false, cache];
    },
    [false, new Set()]
)[0];

function* asSlicesOfSize (n, xs) {
    let i = 0;

    for (let i = 0; i < xs.length; i++) {
        yield [i, xs.slice(i, i + n)]
    }
}

const BUFFER_SIZE = 14;
readFile("./data6", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    for (const [i, slice] of asSlicesOfSize(BUFFER_SIZE, Array.from(data))) {
        if (!arrayContainsDuplicates(slice)) {
            console.log(`found start at ${i + BUFFER_SIZE}`);
            break;
        }
    }

    console.log("done");
});