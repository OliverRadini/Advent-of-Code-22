const { readFile } = require("fs");

console.time();

function* stringByLine(string) {
    let currentLine = "";
    const max = string.length;
    for (let i = 0; i < max; i++) {
        const char = string[i];
        if (char === "\n") {
            yield currentLine;
            currentLine = "";
        } else {
            currentLine = `${currentLine}${char}`;
        }
    }
}

function* delineatedLineGroups (rawData, f) {
    const lines = rawData.split("\n");
    let group = [];
    for (let i = 0; i < lines.length; i++) {
        const thisLine = lines[i];

        if (f(thisLine)) {
            yield group;
            group = [];
        } else {
            group.push(thisLine);
        }
    }
}

readFile("./data", "utf8", (err, data) => {
    if (err) {
        return;
    }

    const groups = [];
    for (let group of delineatedLineGroups(data, x => x.length === 0)) {
        groups.push(group.map(Number));
    }

    const result = groups
        .map(group => group.reduce(
            (p, c) => p + c, 0
        ))
        .sort((a, b) => a > b ? -1 : 1)
        .slice(0, 3)
        .reduce((p, c) => p + c, 0);

    console.log(result);

    // const fileData = data.toString();
    // let current = 0;
    // let currentMax = 0;
    
    // for (let line of stringByLine(fileData)) {
    //     if (line.length === 0) {
    //         if (current > currentMax) {
    //             currentMax = current;
    //         }
    //         current = 0;
    //         continue;
    //     }
    //     current += Number(line);
    // }

    // console.timeEnd();
    // console.log(currentMax);
});
