const { readFile } = require("fs");

const groupBy = f => xs => xs.reduce(
    (p, c) => {
        const thisKey = f(c);
        if (!p.hasOwnProperty(thisKey)) {
            p[thisKey] = [c];
            return p;
        }

        return {
            ...p,
            [thisKey]: [...p[thisKey], c]
        };
    },
    {}
);
const shelvedPeakReducer = ({ currentShelf, aboveShelf, pastInitialDip }, c, i) => {
    return {
        currentShelf: c.z > currentShelf ? c.z : currentShelf,
        aboveShelf:  !pastInitialDip ? [...aboveShelf, c] : aboveShelf,
            // !pastInitialDip || c.z > currentShelf ? [...aboveShelf, c] : aboveShelf,
        pastInitialDip: pastInitialDip || c.z >= currentShelf
    };
};

console.log([{ z: 5 }, {z: 0}].reduce(shelvedPeakReducer, { currentShelf: 5, aboveShelf: [], pastInitialDip: false }))

const parseGrid = input => input
    .split("\n")
    .map(line => line.split(""))
    .map((line, y) => line.map((z, x) => ({x, y, z: Number(z) })))
    .flat();

// const getVisible = xs => xs
//     .map(commonXValueItems => commonXValueItems.reduce(shelvedPeakReducer, { currentShelf: -1, aboveShelf: [] }))
//     .map(x => x.aboveShelf);

const getLineGettersFromPoint = ({ x, y }) => ({
    up: (p, point) => {
        if (point.x === x && point.y > y) {
            p.push(point);
        }
        return p;
    },
    down: (p, point) => {
        if (point.x === x && point.y < y) {
            p.unshift(point);
        }
        return p;
    },
    left: (p, point) => {
        if (point.y === y && point.x < x) {
            p.unshift(point);
        }
        return p;
    },
    right: (p, point) => {
        if (point.y === y && point.x > x) {
            p.push(point);
        }
        return p;
    } 
});

const countVisibleFromPoint = (point, grid) => {
    const pointGetters = getLineGettersFromPoint(point);

    const points = Object.keys(pointGetters)
        .reduce(
            (p, k) => ({
                ...p,
                [k]: grid
                    .reduce(pointGetters[k], [])
                    .reduce(
                        shelvedPeakReducer,
                        { aboveShelf: [], currentShelf: point.z, pastInitialDip: false }
                    )
                    .aboveShelf
                    .length
            }),
            {}
        );

    if (point.x === 3 && point.y === 2) {
        const test1 = grid.reduce(pointGetters.left, []);
        const test2 = grid.reduce(pointGetters.right, []);
        const test3 = grid.reduce(pointGetters.up, []);
        const test4 = grid.reduce(pointGetters.down, []);
        console.log("YUP");
    }

    return Object.keys(points)
        .reduce(
            (p, k) => p * points[k],
            1
        );
};

readFile("./data8", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    const grid = parseGrid(data);
    const visibleCounts = grid.map(point => [point, countVisibleFromPoint(point, grid)])

    const result = visibleCounts.sort((a, b) => a[1] > b[1] ? -1 : 1)[0];
    // const byX = Object.values(groupBy(x => x.x)(grid)).sort(({ x }, { x1 }) => x > x1 ? 1 : -1);
    // const byY = Object.values(groupBy(x => x.y)(grid)).sort(({ y }, { y1 }) => y > y1 ? 1 : -1);;

    // const allShelvedPeaks = groupBy(x => `${x.x}-${x.y}`)([
    //     ...getVisible(Object.values(byX)),
    //     ...getVisible(Object.values(byY)),
    //     ...getVisible(Object.values(byX).map(x => x.reverse())),
    //     ...getVisible(Object.values(byY).map(x => x.reverse())),
    // ].flat());
    // const result = Object.keys(allShelvedPeaks).length;

    console.log(result);
});
