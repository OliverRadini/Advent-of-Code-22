const { readFile } = require("fs");

const take = n => xs => xs.slice(0, n);

const arrayContainsDuplicates = xs => xs.reduce(
    ([hasMatchAlready, cache], c) => hasMatchAlready ? [true, cache] : [cache.has(c), cache],
    [false, new Set()]
);

const BUFFER_SIZE = 4;
readFile("./data6", "utf", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    const test = arrayContainsDuplicates([1, 2, 4, 2, 5]);
    console.log("done");

});