const { readFile } = require("fs");

const initialState = {
    currentDir: [],
    directories: {
        "/": {}
    }
};

const parseLine = line => line;

function* parseTerminal (terminal) {
    const lines = terminal.split("\n");

    let currentGroup = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (currentGroup.length === 0) {
            currentGroup.push(parseLine(line));
        } else {
            if (line[0] === "$") {
                yield currentGroup;
                currentGroup = [line];
            } else {
                currentGroup.push(parseLine(line));
            }
        }
    }
    yield currentGroup;
};

const adjustAtPath = (path, object, f) => {
    if (path.length === 1) {
        return {
            ...object,
            [path[0]]: f(object[path[0]]),
        };
    }

    return object[path[0]] === undefined
        ? {
            ...object,
            [path[0]]: adjustAtPath(path.slice(1), [], f)
        }
        : {
            ...object,
            [path[0]]: adjustAtPath(path.slice(1), object[path[0]], f)
        };
};

const fileContentsReducer = (p, c) => ({
    ...p,
    [c.name]: c.size,
});

const handleLs = (state, contents) => ({
    ...state,
    directories: adjustAtPath(
        state.currentDir,
        state.directories,
        x => {
            if (x === undefined) {
                return contents.reduce(fileContentsReducer, {});
            }

            try {
                return { ...x, ...contents.reduce(fileContentsReducer, {}) };
            } catch (e) {
                console.log(e);
            }
        }
    )
});


const parseLsLine = line => {
    const [a, b] = line.split(" ");
    return a === "dir"
        ? { type: "folder", name: b}
        : { type: "file", size: Number(a), name: b };
};


const parseCommand = command => {
    const commandName = command[0].split(" ")[1];

    switch (commandName) {
        case "cd":
            return {
                type: "cd",
                payload: command[0].split(" ")[2]
            };
        case "ls":
            return {
                type: "ls",
                payload: command.slice(1).map(parseLsLine).filter(x => x.type === "file")
            };
    }
};


const stateReducer = (state, action) => {
    switch (action.type) {
        case "cd":
            return {
                ...state,
                currentDir: action.payload === ".."
                    ? state.currentDir.slice(0, -1) 
                    : [...state.currentDir, action.payload]
            };
        case "ls":
            return handleLs(state, action.payload);
    }
};

const sizeDirectory = directory => {
    return Object.values(directory)
        .reduce(
            (p, c) => p + (
                typeof c === "number"
                    ? c
                    : sizeDirectory(c)
            ),
            0
        );
};

const sizeAllDirectories = directoriesState => {

    const directoriesInThisFolder = Object.keys(directoriesState)
        .filter(k => typeof directoriesState[k] === "object");

    if (directoriesInThisFolder.length === 0) {
        return [];
    }

    const sizeOfTheDirectoriesInThisFolder = directoriesInThisFolder
        .map(dirName => [dirName, sizeDirectory(directoriesState[dirName])]);

    const recursedContents = directoriesInThisFolder
        .map(dirName => sizeAllDirectories(directoriesState[dirName])).flat();

    return [...sizeOfTheDirectoriesInThisFolder, ...recursedContents];
};

const SYSTEM_DISK_SIZE = 70000000;
const FREE_SPACE_REQUIRED = 30000000;

readFile("./data7", "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    let state = initialState;
    for (const x of parseTerminal(data)) {
        state = stateReducer(state, parseCommand(x))
    }

    const directorySizes = sizeAllDirectories(state.directories);

    console.log(directorySizes);

    const totalUsedSpace = directorySizes.find(x => x[0] === "/")[1];
    const sizeRequiredToDelete = FREE_SPACE_REQUIRED - (SYSTEM_DISK_SIZE - totalUsedSpace);

    const filesBigEnoughToClearSpace = directorySizes.filter(([_, size]) => size > sizeRequiredToDelete);

    console.log(filesBigEnoughToClearSpace.sort(([_, a], [__, b]) => a > b ? 1 : -1)[0]);
});
