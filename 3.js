const { readFile } = require("fs");

const priorities = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10,
    k: 11,
    l: 12,
    m: 13,
    n: 14,
    o: 15,
    p: 16,
    q: 17,
    r: 18,
    s: 19,
    t: 20,
    u: 21,
    v: 22,
    w: 23,
    x: 24,
    y: 25,
    z: 26,
    A: 27,
    B: 28,
    C: 29,
    D: 30,
    E: 31,
    F: 32,
    G: 33,
    H: 34,
    I: 35,
    J: 36,
    K: 37,
    L: 38,
    M: 39,
    N: 40,
    O: 41,
    P: 42,
    Q: 43,
    R: 44,
    S: 45,
    T: 46,
    U: 47,
    V: 48,
    W: 49,
    X: 50,
    Y: 51,
    Z: 52 
};

const bagToCompartments = line => {
    const middle = Math.floor(line.length / 2);

    return [new Set(Array.from(line.substr(0, middle))), new Set(Array.from(line.substr(middle)))];
};

const intersectionOfSets = (...sets) => {
    const intersection = [];

    const [rootSet, ...otherSets] = sets;
    rootSet.forEach(x => {
        if (otherSets.every(s => s.has(x))) {
            intersection.push(x);
        }
    });

    return intersection;
}

const takeDuplicatesFromLine = line => {
    const [c1, c2] = bagToCompartments(line);
    
    return intersectionOfSets(c1, c2);
}

readFile("./data3", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    const groupSize = 3;
    const lines = data.split("\n").map(xs => new Set(xs));
    const groups = [];

    for (let i = 0; i < lines.length; i += groupSize) {
        groups.push(lines.slice(i, i + groupSize));
    }

    const result = groups
        .map(group => intersectionOfSets(...group))
        .flatMap(x => priorities[x])
        .filter(x => x !== undefined)
        .reduce((p, c) => p + c, 0);


    console.log(result);
});
