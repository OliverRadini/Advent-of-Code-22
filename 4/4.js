const { readFile } = require("fs");

const overlap = ([a1, a2], [b1, b2]) =>
    (a1 >= b1 && a1 <= b2) || (a2 >= b1 && a2 <= b2) ||
    (b1 >= a1 && b1 <= a2) || (b2 >= a1 && b2 <= a2);


readFile("./data4", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    const result = data.split("\n")
        .map(line => {
            const [a1, a2, b1, b2] = line.split(",").map(x => x.split("-")).flat().map(Number);
            return [[a1, a2], [b1, b2]];
        })
        .map(([a, b]) => overlap(a, b))
        .reduce((p, c) => c ? p + 1 : p, 0);

    console.log(result);
});