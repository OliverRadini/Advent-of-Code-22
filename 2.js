const { readFile } = require("fs");

console.time();
// A for Rock, B for Paper, and C for Scissors
// X for Rock, Y for Paper, and Z for Scissors
// 1 for Rock, 2 for Paper, and 3 for Scissors
// "Anyway, the second column says how the round needs to end: 
// X means you need to lose,
// Y means you need to end the round in a draw,
// Z means you need to win. Good luck!"

const scores = {
    A: {
        // lose, scissors 3
        X: 3,
        // draw, rock 1
        Y: 4,
        // win, paper 2
        Z: 8
    },
    B: {
        // lose, rock 1
        X: 1,
        // draw, paper 2
        Y: 5,
        // win, scissors 3
        Z: 9
    },
    C: {
        // lose, paper 2
        X: 2,
        // draw, scissors 3
        Y: 6,
        // win, rock 1
        Z: 7
    }
};

readFile("./data2", "utf8", (err, data) => {
    if (err) {
        return;
    }

    let total = 0;
    for (let i = 0; i < data.length; i += 4) {

        total += scores[data[i]][data[i + 2]];
    }

    console.timeEnd();
    console.log(total);

    // const asString = data.toString();
    // const result = asString.split("\n")
    //     .reduce((p, c) => p + scores[c[0]][c[2]], 0);

    // console.log(result);
});
