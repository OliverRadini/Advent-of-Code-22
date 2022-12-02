const { createReadStream } = require("fs");
const readLine = require("readline");

console.time();

const readStream = readLine.createInterface({
    input: createReadStream("./data")
});

let thisTotal = 0;
let currentMax = 0;
readStream.on("line", line => {
    if (line !== "") {
        thisTotal += Number(line);
    } else {
        if (thisTotal > currentMax) {
            console.log(currentMax);
            currentMax = thisTotal;
        }
        thisTotal = 0;
    }
});

readStream.on("close", () => {
    console.log(currentMax);
    console.timeEnd();
});
