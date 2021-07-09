"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bd2bg = void 0;
const util_1 = require("../util");
class TickStack {
    constructor() {
    }
    push(...items) {
        this.notes.push(...items);
        this.notes.sort((a, b) => {
            return a.beat.toNumber() - b.beat.toNumber();
        });
    }
}
class TickStackManager {
    constructor() {
        this.TickStacks = {};
    }
    push(tickStack) {
        let i = 0;
        while (this.TickStacks[i])
            i++;
        this.TickStacks[i] = tickStack;
        return i;
    }
    get(id) {
        if (this.TickStacks[id])
            return this.TickStacks[id];
        return null;
    }
    remove(id) {
        if (this.TickStacks[id]) {
            const t = this.TickStacks[id];
            this.TickStacks[id] = undefined;
            return t;
        }
        return null;
    }
}
function bd2bg(notes) {
    let bpm = [];
    let groups = [{
            notes: [],
            points: [
                {
                    beat: new util_1.Fractional([-100, 0, 1]),
                    speed: { value: 1, transition: 0 },
                    tap: { r: 113, g: 237, b: 255, a: 255, transition: 0 },
                    tapGrey: { r: 180, g: 180, b: 180, a: 255, transition: 0 },
                    flick: { r: 255, g: 59, b: 114, a: 255, transition: 0 },
                    slideTick: { r: 84, g: 230, b: 44, a: 255, transition: 0 },
                    slide: { r: 84, g: 230, b: 44, a: 255, transition: 0 }
                }
            ],
            flags: 0
        }];
    let tickStacks = {};
    let longs = {};
    notes.forEach((note) => {
        const beat = ("beat" in note && typeof note.beat === "number") ? util_1.Fractional.from(note.beat, 0.0625) : null;
        switch (note.type) {
            case "BPM": {
                note = note;
                if (beat === null)
                    throw new Error("No beat value for timepoint");
                bpm.push({
                    beat,
                    value: note.bpm
                });
                break;
            }
            case "Single": {
                note = note;
                if (beat === null)
                    throw new Error("No beat value for note");
                const bgNote = {
                    type: note.flick ? "Flick" : "Single",
                    beat,
                    lane: note.lane,
                    tickStack: 0,
                    flags: 0
                };
                groups[0].notes.push(bgNote);
                break;
            }
            case "Directional": {
                note = note;
                if (beat === null)
                    throw new Error("No beat value for note");
                const bgNote = {
                    type: "Flick",
                    beat,
                    lane: note.lane,
                    tickStack: 0,
                    flags: 0
                };
            }
            case "Long":
            case "Slide": {
                note = note;
                const connections = note.connections.filter((c, i, a) => i === 0 || i + 1 === a.length || !c.hidden);
                if (connections.length < 2) {
                    console.warn("A slide has less than 2 notes");
                    break;
                }
                // 有效的 TickStack 是从 1 开始的
                const tickStackIndex = Object.keys(tickStacks).length + 1;
                const tickStack = {
                    start: null,
                    end: null
                };
                connections.forEach((connection, index, array) => {
                    let bgNote = {
                        type: "Single",
                        beat: util_1.Fractional.from(connection.beat, 0.0625),
                        lane: connection.lane,
                        tickStack: tickStackIndex,
                        flags: 0
                    };
                    if (index === 0) {
                        bgNote.type = "Single";
                        tickStack.start = bgNote;
                    }
                    else if (index + 1 === array.length) {
                        bgNote.type = connection.flick ? "Flick" : "SlideTickEnd";
                        tickStack.end = bgNote;
                    }
                    else
                        bgNote.type = "SlideTick";
                    groups[0].notes.push(bgNote);
                });
                break;
            }
        }
    });
    return { groups, bpm };
}
exports.bd2bg = bd2bg;
