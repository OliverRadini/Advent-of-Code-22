const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data15_2";

const zip = (a, b) => a.map((x, i) => [x, b[i]]);

const range = (from, to) => {
    try {
        return Array.from(Array((to + 1) - from))
            .map((_, i) => from + i);
    } catch (err) {
        console.log(err);
    }
}

const getPointsOfDistanceFromPoint = (x, y) => d => {
    const xDiffs = range(-d, d);
    const yDiffs = xDiffs.map(n => n < 0 ? (d - Math.abs(n)) * -1 : d - n);

    return zip(xDiffs, yDiffs)
        .map(([xD, yD]) => [x + xD, y + yD]);
}

const sensorData = readFileSync(filePath, "utf8")
    .split("\n")
    .map(line => line
            .replace(/Sensor at x=/g, " ")
            .replace(/, y=/g, " ")
            .replace(/: closest beacon is at x=/, " ")
            .replace(/ /g, " ")
            .split(/ /g)
            .filter(x => x.trim().length > 0)
            .map(Number)
    )
    .map(([ sX, sY, bX, bY ]) => ({ sX, sY, bX, bY }))
    .map(({ sX, sY, bX, bY }) => ({
        sX, sY, bX, bY,
        distance: Math.abs(sX - bX) + Math.abs(sY - bY),
    }))
    // .map(s => ({
    //     ...s,
    //     coverage: range(0, s.distance)
    //         .flatMap(d => getPointsOfDistanceFromPoint(s.sX, s.sY)(d))
    // }));

// TODO: iterate all 'squares' in a row and see which aren't in the range
//       of a sensor

const squareIsWithinABeaconsRange = (x, y) => {
    for (let i = 0; i < sensorData.length; i++) {
        const thisSensor = sensorData[i];
        const {sX, sY, distance} = thisSensor;
        const xDistanceFromSensor = Math.max(sX, x) - Math.min(sX, x);
        const yDistanceFromSensor = Math.max(sY, y) - Math.min(sY, y);
        const totalDistance = xDistanceFromSensor + yDistanceFromSensor;

        if (totalDistance <= distance) {
            // console.log(`Square (${x}, ${y}) is ${totalDistance} from sensor at (${sX}, ${y}) which has a distance of ${distance}`);
            return true;
        }
    }

    return false;
}

const getAvailableBeaconSquares = (xFrom, xTo, y) => {
    let takenSquares = 0;
    for (let x = xFrom; x <= xTo; x++) {
        // console.log(`Checking (${x}, ${y})`);
        const thisSquareIsWithinABeaconsRange = squareIsWithinABeaconsRange(x, y)
        if (thisSquareIsWithinABeaconsRange) {
            takenSquares++;
        }
    }

    return takenSquares;
}

const allYCoords = sensorData.flatMap(({ sY, bY, distance }) => [sY + distance, sY - distance, bY]);
const allXCoords = sensorData.flatMap(({ sX, bX, distance }) => [sX + distance, sX - distance, bX]);
const minimumX = Math.min(...allXCoords);
const minimumY = Math.min(...allYCoords);
const maximumX = Math.max(...allXCoords);
const maximumY = Math.max(...allYCoords);

const result = getAvailableBeaconSquares(minimumX, maximumX, 2000000);
console.log(result);
// const groupBy = f => xs => xs.reduce((p, c) => {
//     const thisKey = f(c);
//     if (p.hasOwnProperty(thisKey)) {
//         p[thisKey].push(c);
//         return p;
//     }

//     p[thisKey] = [c];
//     return p;
// }, {});

// const mapValues = f => o => Object.keys(o)
//     .reduce((p, c) => ({
//         ...p,
//         [c]: f(o[c])
//     }));

// const takeUniqueXValues = coords => Object.keys(groupBy(x => x)(coords.map(x => x[0]))).map(Number)
// const allCoveredAreas = mapValues(takeUniqueXValues)(
//     groupBy(x => x[1])(sensorData.flatMap(s => s.coverage))
// );



// console.log(allCoveredAreas['10']);