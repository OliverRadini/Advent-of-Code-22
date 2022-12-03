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

readFile("./data", (err, data) => {
    if (err) {
        return;
    }

    const fileData = data.toString();
    let current = 0;
    let currentMax = 0;
    
    for (let line of stringByLine(fileData)) {
        if (line.length === 0) {
            if (current > currentMax) {
                currentMax = current;
            }
            current = 0;
            continue;
        }
        current += Number(line);
    }

    console.log(currentMax);
    console.timeEnd();
});
