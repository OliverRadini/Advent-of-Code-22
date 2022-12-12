const { readFileSync } = require("fs");

let input = readFileSync("./data10", "utf8");

const commands = input
    .split("\n")
    .map(line => line.split(" "))
    .map(([c, n]) => ({ c, n: n === undefined ? null : Number(n) }));


const SCREEN_WIDTH = 40;
const SCREEN_HEIGHT = 6;
const CYCLES = SCREEN_WIDTH * SCREEN_HEIGHT;

const screenOutput = Array.from(Array(SCREEN_HEIGHT)).map(
    () => Array.from(Array(SCREEN_WIDTH)).map(() => ".")
);

let currentRow = 0;
function addOutputToScreen() {
}

let register = 1;
let cycle;
let commandPointer = 0;

let currentOperation = null;
let currentOperationTimeRemaining = 0;

for (cycle = 0; cycle < CYCLES; cycle++) {
    // start of cycle
    if (currentOperation !== null && currentOperationTimeRemaining === 0) {
        currentOperation();
    }

    const {c, n} = commands[commandPointer] || { c: "noop", n: null };
    if (c === "addx" && currentOperationTimeRemaining === 0) {
        console.log(`Start cycle ${cycle}: begin executing addx ${n}`);
        currentOperation = () => {
            register += n;
            commandPointer++;
            currentOperation = null;
            currentOperationTimeRemaining = 0;
        };
        currentOperationTimeRemaining = 2;
    } else if (currentOperationTimeRemaining === 0) {
        console.log(`Start cycle ${cycle}: execute noop}`);
        currentOperation = () => {
            commandPointer++;
            currentOperation = null;
            currentOperationTimeRemaining = 0;
        };
        currentOperationTimeRemaining = 1;
    }

    // during cycle
    const pixelXPosition = cycle % SCREEN_WIDTH;

    console.log(`During cycle ${cycle}: CRT draws pixel at position ${pixelXPosition}`);
    console.log(`Current CRT row: ${screenOutput[currentRow].join("")}`);

    if (cycle % SCREEN_WIDTH === 0 && cycle > 0) {
        currentRow++;
    }

    if (register -1 === pixelXPosition || register === pixelXPosition || register + 1 === pixelXPosition) {
        screenOutput[currentRow][pixelXPosition] = "#";
    }

    // end of cycle

    if (currentOperationTimeRemaining > 0) {
        currentOperationTimeRemaining -= 1;
    }
    console.log("\n\n")
}

console.log(screenOutput.map(x => x.join("")).join("\n"));