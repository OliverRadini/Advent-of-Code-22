const { readFileSync } = require("fs");

const filePath = process.argv[2] || "./data15_2";
const scanRange = Number(process.argv[3] || "20")


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
    }));


function* getPerimeterCoords (pX, pY, d) {
    for (let x = -d; x <= d; x++) {
        const thisDistance = d - Math.abs(x);
        yield([pX + x, pY + thisDistance]);
        yield([pX + x, pY - thisDistance]);
    }
}

const pointIsIsSensorRange = (pX, pY, { sX, sY, distance }) => {
    const xDistance = Math.max(pX, sX) - Math.min(pX, sX);
    const yDistance = Math.max(pY, sY) - Math.min(pY, sY);
    return (xDistance + yDistance) <= distance
}

const magicCoords = [];
outerSensors: for (let i = 0; i < sensorData.length; i++) {
    console.log(`${i} / ${sensorData.length}`);
    const thisSensor = sensorData[i];
    coords: for (let coord of getPerimeterCoords(thisSensor.sX, thisSensor.sY, thisSensor.distance + 1)) {
        if (coord[0] < 0 || coord[0] > scanRange || coord[1] < 0 || coord[1] > scanRange) {
            continue coords;
        }
        // console.log(`(${coord[0]}, ${coord[1]})`)

        if (coord[0] === 13 && coord[1] === 10) {
            console.log("a");
        }
        innerSensors: for (let j = 0; j < sensorData.length; j++) {
            if (j === i) {
                continue innerSensors;
            }
            const checkSensor = sensorData[j];
            const inSensorsRange = pointIsIsSensorRange(coord[0], coord[1], checkSensor);
            if (inSensorsRange) {
                continue coords;
            }
        }

        // if we reached here, we know it is out of all sensors ranges
        magicCoords.push(coord);
    }
}

console.log(magicCoords[0][0] * 4000000 + magicCoords[0][1]);