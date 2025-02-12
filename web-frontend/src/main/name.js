const NAMES = [
    "Jim",
    "Timothy",
    "Carl",
    "Steve",
    "Bob",
    "Jerry",
    "Linda",
    "Pam",
    "Gregory",
    "Susan",
    "Nancy",
    "Frank",
    "Clara",
    "George",
    "Betty",
    "Tommy",
    "Samantha",
    "Oliver",
    "Rebecca",
    "Danny",
    "Jessica",
    "Brian",
    "Emily",
    "Chad",
    "Abigail",
    "Johnny",
    "Penelope",
    "Walter",
    "Sophia",
    "Bruce",
    "Alice",
    "Harry",
    "Molly",
    "Eugene",
    "Donna",
    "Patrick",
    "Tina",
    "Martha",
    "Albert",
    "Nina",
    "Freddy",
    "Gloria",
    "Ricky",
    "Victoria",
];

const generateName = () => {
    const name1 = NAMES[Math.floor(Math.random() * NAMES.length)];
    const name2 = NAMES[Math.floor(Math.random() * NAMES.length)];
    const split1 = Math.floor(name1.length / 2);
    const split2 = Math.floor(name2.length / 2);
    const part1 = name1.slice(0, split1);
    const part2 = name2.slice(split2);
    return part1 + part2;
};

const LOCAL_STORAGE_KEY = "player-name";

export const getName = () => {
    return generateName();
    // let name = localStorage.getItem(LOCAL_STORAGE_KEY);
    // if (!name) {
    //     name = generateName();
    //     setName(name);
    // }
    // return name;
};

export const setName = (name) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, name);
};
