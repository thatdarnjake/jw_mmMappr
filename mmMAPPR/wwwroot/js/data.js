// mmMAPPR Family Data - extracted from Faherty.xlsx
const FAMILY_DATA = [
    { name: "Thomas Faherty", birthday: "1913-02-03", gen: 0, color: "Purple" },
    { name: "Mom Mom", birthday: "1920-02-15", gen: 0, color: "Purple" },
    { name: "Tom Faherty", birthday: "1952-03-01", gen: 1, color: "Yellow" },
    { name: "Terry Faherty", birthday: "1954-04-11", gen: 1, color: "Red" },
    { name: "Tim Faherty", birthday: "1955-05-18", gen: 1, color: "Green" },
    { name: "Kathy Wiest", birthday: "1956-09-03", gen: 1, color: "Blue" },
    { name: "Dennis Faherty", birthday: "1958-11-21", gen: 1, color: "Orange" },
    { name: "Barb Faherty", birthday: "1952-08-13", gen: 1, color: "Yellow" },
    { name: "Jeff Wiest", birthday: "1954-10-07", gen: 1, color: "Blue" },
    { name: "Diane Faherty", birthday: "1958-11-20", gen: 1, color: "Orange" },
    { name: "Gayle Faherty", birthday: "1955-10-08", gen: 1, color: "Green" },
    { name: "Jan Faherty", birthday: "1954-04-11", gen: 1, color: "Red" },
    { name: "Sarah King", birthday: "1979-10-03", gen: 2, color: "Yellow" },
    { name: "James King", birthday: "1978-12-07", gen: 2, color: "Yellow" },
    { name: "Brendan King", birthday: "2009-04-30", gen: 3, color: "Yellow" },
    { name: "Meghan King", birthday: "2010-08-24", gen: 3, color: "Yellow" },
    { name: "Declan King", birthday: "2014-05-19", gen: 3, color: "Yellow" },
    { name: "Claire Rascoe", birthday: "1981-10-21", gen: 2, color: "Yellow" },
    { name: "James Rascoe", birthday: "1979-11-02", gen: 2, color: "Yellow" },
    { name: "Nora Rascoe", birthday: "2021-05-17", gen: 3, color: "Yellow" },
    { name: "Ian Rascoe", birthday: "2015-06-30", gen: 3, color: "Yellow" },
    { name: "Mike Faherty", birthday: "1984-08-12", gen: 2, color: "Yellow" },
    { name: "Kara Faherty", birthday: "1984-04-10", gen: 2, color: "Yellow" },
    { name: "Nate Faherty", birthday: "2014-12-08", gen: 3, color: "Yellow" },
    { name: "Eve Faherty", birthday: "2017-06-17", gen: 3, color: "Yellow" },
    { name: "Noah Faherty", birthday: "2021-12-18", gen: 3, color: "Yellow" },
    { name: "Emily Rose", birthday: "1986-06-20", gen: 2, color: "Yellow" },
    { name: "Jordan Rose", birthday: "1987-05-23", gen: 2, color: "Yellow" },
    { name: "Keely Rose", birthday: "2021-08-10", gen: 3, color: "Yellow" },
    { name: "Milo Rose", birthday: "2023-06-30", gen: 3, color: "Yellow" },
    { name: "Maura Nimmo", birthday: "1991-06-23", gen: 2, color: "Yellow" },
    { name: "Dean Nimmo", birthday: "1992-03-18", gen: 2, color: "Yellow" },
    { name: "Rory Nimmo", birthday: "2022-04-21", gen: 3, color: "Yellow" },
    { name: "Colin Nimmo", birthday: "2023-08-03", gen: 3, color: "Yellow" },
    { name: "Tessa", birthday: "2025-05-14", gen: 3, color: "Yellow" },
    { name: "Katie Faherty", birthday: "1983-02-18", gen: 2, color: "Green" },
    { name: "Erin Faherty", birthday: "1985-04-30", gen: 2, color: "Green" },
    { name: "Chris Faherty", birthday: "1985-05-16", gen: 2, color: "Green" },
    { name: "Luke Faherty", birthday: "2022-10-11", gen: 3, color: "Green" },
    { name: "Owen Faherty", birthday: "2025-06-30", gen: 3, color: "Green" },
    { name: "Christie Goldstein", birthday: "1986-08-24", gen: 2, color: "Blue" },
    { name: "Jeff Goldstein", birthday: "1990-03-17", gen: 2, color: "Blue" },
    { name: "Jack Goldstein", birthday: "2022-07-31", gen: 3, color: "Blue" },
    { name: "Will Goldstein", birthday: "2025-04-02", gen: 3, color: "Blue" },
    { name: "Jake Wiest", birthday: "1989-01-11", gen: 2, color: "Blue" },
    { name: "Lauren Peczkowski", birthday: "1989-01-19", gen: 2, color: "Blue" },
    { name: "Paul Faherty", birthday: "1999-11-18", gen: 2, color: "Orange" },
    { name: "Maeve Faherty", birthday: "2001-08-02", gen: 2, color: "Orange" }
];

// Family line display config
const FAMILY_LINES = {
    Purple:  { label: "Grandparents", css: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
    Yellow:  { label: "Tom Faherty", css: "#ca8a04", bg: "#fefce8", border: "#fde047" },
    Red:     { label: "Terry Faherty", css: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
    Green:   { label: "Tim Faherty", css: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
    Blue:    { label: "Kathy & Jeff Wiest", css: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
    Orange:  { label: "Dennis Faherty", css: "#ea580c", bg: "#fff7ed", border: "#fdba74" }
};

// Zodiac signs (month/day boundaries)
const ZODIAC_SIGNS = [
    { name: "Capricorn",   symbol: "\u2651", startM: 12, startD: 22, endM: 1,  endD: 19 },
    { name: "Aquarius",    symbol: "\u2652", startM: 1,  startD: 20, endM: 2,  endD: 18 },
    { name: "Pisces",      symbol: "\u2653", startM: 2,  startD: 19, endM: 3,  endD: 20 },
    { name: "Aries",       symbol: "\u2648", startM: 3,  startD: 21, endM: 4,  endD: 19 },
    { name: "Taurus",      symbol: "\u2649", startM: 4,  startD: 20, endM: 5,  endD: 20 },
    { name: "Gemini",      symbol: "\u264A", startM: 5,  startD: 21, endM: 6,  endD: 20 },
    { name: "Cancer",      symbol: "\u264B", startM: 6,  startD: 21, endM: 7,  endD: 22 },
    { name: "Leo",         symbol: "\u264C", startM: 7,  startD: 23, endM: 8,  endD: 22 },
    { name: "Virgo",       symbol: "\u264D", startM: 8,  startD: 23, endM: 9,  endD: 22 },
    { name: "Libra",       symbol: "\u264E", startM: 9,  startD: 23, endM: 10, endD: 22 },
    { name: "Scorpio",     symbol: "\u264F", startM: 10, startD: 23, endM: 11, endD: 21 },
    { name: "Sagittarius", symbol: "\u2650", startM: 11, startD: 22, endM: 12, endD: 21 }
];

// Chinese zodiac (cycle starts at known Rat year: 1924)
const CHINESE_ZODIAC = [
    { name: "Rat",     emoji: "\uD83D\uDC00" },
    { name: "Ox",      emoji: "\uD83D\uDC02" },
    { name: "Tiger",   emoji: "\uD83D\uDC05" },
    { name: "Rabbit",  emoji: "\uD83D\uDC07" },
    { name: "Dragon",  emoji: "\uD83D\uDC09" },
    { name: "Snake",   emoji: "\uD83D\uDC0D" },
    { name: "Horse",   emoji: "\uD83D\uDC0E" },
    { name: "Goat",    emoji: "\uD83D\uDC10" },
    { name: "Monkey",  emoji: "\uD83D\uDC12" },
    { name: "Rooster", emoji: "\uD83D\uDC13" },
    { name: "Dog",     emoji: "\uD83D\uDC15" },
    { name: "Pig",     emoji: "\uD83D\uDC16" }
];

// Generation definitions
const GENERATIONS = [
    { name: "Greatest Gen", start: 1901, end: 1927, color: "#78716c" },
    { name: "Silent Gen", start: 1928, end: 1945, color: "#a8a29e" },
    { name: "Baby Boomers", start: 1946, end: 1964, color: "#f59e0b" },
    { name: "Gen X", start: 1965, end: 1980, color: "#ef4444" },
    { name: "Millennials", start: 1981, end: 1996, color: "#8b5cf6" },
    { name: "Gen Z", start: 1997, end: 2012, color: "#06b6d4" },
    { name: "Gen Alpha", start: 2013, end: 2030, color: "#22c55e" }
];
