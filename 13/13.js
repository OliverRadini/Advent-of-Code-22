const { assert } = require("console");
const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data13";

const groupsOfSize = (n, xs) => {
    const groups = [];
    let thisGroup = []
    for (let i = 0; i < xs.length; i++) {
        if (thisGroup.length === n) {
            groups.push(thisGroup);
            thisGroup = []
        }
        thisGroup.push(xs[i]);
    }
    groups.push(thisGroup);
    return groups;
};

const input = groupsOfSize(3, readFileSync(filePath, "utf8").split("\n"))
    .map(x => x.slice(0, 2))
    .map(x => x.map(JSON.parse))
    .flatMap(x => x);

console.log(input);

const zip = (a, b) => {
    const maxLength = Math.max(a.length, b.length);

    const result = [];
    for (let i = 0; i < maxLength; i++) {
        // console.log(`About to push ${[a[i], b[i]]}`);
        result.push([a[i], b[i]]);
    }

    return result;
}

const comparisonResult = {
    correct: "correct",
    incorrect: "incorrect",
    undecided: "undecided"
};

/**
 * If both values are integers, the lower integer should come first.
 * If the left integer is lower than the right integer,
 * the inputs are in the right order. If the left integer is higher
 * than the right integer, the inputs are not in the right order.
 * Otherwise, the inputs are the same integer; continue checking the
 * next part of the input.
 */
const compareIntegers = (l, r) => {
    if (l < r) {
        return comparisonResult.correct;
    }

    if (l > r) {
        return comparisonResult.incorrect;
    }

    return comparisonResult.undecided;
};

/**
 * If the right list runs out of items first, the inputs
 * are not in the right order.
 */
const decisionOnUndefined = (a, b) => {
    if (a === undefined) {
        return comparisonResult.correct;
    }

    if (b === undefined) {
        return comparisonResult.incorrect;
    }

    return comparisonResult.undecided;
};

/**
 * If both values are lists, compare the first value of each list, then the
 * second value, and so on. If the left list runs out of items first, the
 * inputs are in the right order. If the right list runs out of items first,
 * the inputs are not in the right order. If the lists are the same length
 * and no comparison makes a decision about the order, continue checking
 * the next part of the input.
 */
const compareLists = (l, r) => {
    const zipped = zip(l, r);
    // console.log(zipped);

    return zipped.reduce(
        (p, [a, b]) => {
            // console.log("===========================");
            // console.log(p);
            // console.log("Comparing these two");
            // console.log("a:");
            // console.log(a);
            // console.log("b:");
            // console.log(b);
            // console.log("===========================");

            if (p !== comparisonResult.undecided) {
                return p;
            }

            const decisionBasedOnUndefined = decisionOnUndefined(a, b);

            if (decisionBasedOnUndefined !== comparisonResult.undecided) {
                return decisionBasedOnUndefined;
            }

            const aIsArray = Array.isArray(a);
            const bIsArray = Array.isArray(b);

            if (!aIsArray && !bIsArray) {
                assert(typeof a === "number" && typeof b === "number");
                return compareIntegers(a, b);
            } 

            const aArray = aIsArray ? a : [a];
            const bArray = bIsArray ? b : [b];

            const result = compareLists(aArray, bArray);

            return result;
        },
        comparisonResult.undecided
    );
};

const result = input
    .sort((a, b) => compareLists(a, b) === comparisonResult.correct ? -1 : 1);

const findDividerWithNumber = n => result.findIndex(
    x =>
        Array.isArray(x)
        && x.length === 1
        && x[0].length === 1
        && Array.isArray(x[0])
        && x[0][0] === n
);

const divider2Index = findDividerWithNumber(2) + 1;
const divider6Index = findDividerWithNumber(6) + 1;

console.log(divider2Index * divider6Index);