import {BestdoriNote, NoteBPM, NoteDirectional, NoteLong, NoteSingle, NoteSlide} from "../api/Bestdori";
import {Bpm, Group, Note as BanGroundNote} from "../entity/BanGround";
import {decimalsToFractional, Fractional} from "../util";

class TickStack {
    private notes: BanGroundNote[]

    constructor() {
    }

    public push(...items: BanGroundNote[]) {
        this.notes.push(...items)
        this.notes.sort((a, b) => {
            return a.beat.toNumber() - b.beat.toNumber()
        })
    }
}

class TickStackManager {
    private TickStacks: Record<number, TickStack> = {}

    public push(tickStack: TickStack): number {
        let i = 0
        while (this.TickStacks[i]) i++
        this.TickStacks[i] = tickStack
        return i
    }

    public get(id: number): TickStack | null {
        if (this.TickStacks[id]) return this.TickStacks[id]
        return null
    }

    public remove(id: number): TickStack | null {
        if (this.TickStacks[id]) {
            const t = this.TickStacks[id]
            this.TickStacks[id] = undefined
            return t
        }
        return null
    }
}

export function bd2bg(notes: Array<BestdoriNote>): { groups: Group[], bpm: Bpm[] } {
    let bpm: Bpm[] = []
    let groups: Group[] = [{
        notes: [],
        points: [
            {
                beat: new Fractional([-100, 0, 1]),
                speed: {value: 1, transition: 0},
                tap: {r: 113, g: 237, b: 255, a: 255, transition: 0},
                tapGrey: {r: 180, g: 180, b: 180, a: 255, transition: 0},
                flick: {r: 255, g: 59, b: 114, a: 255, transition: 0},
                slideTick: {r: 84, g: 230, b: 44, a: 255, transition: 0},
                slide: {r: 84, g: 230, b: 44, a: 255, transition: 0}
            }
        ],
        flags: 0
    }]


    let tickStacks: Record<number, { start: Fractional, end: Fractional }> = {}
    let longs = {}
    notes.forEach((note: BestdoriNote) => {
        const beat: Fractional =
            ("beat" in note && typeof note.beat === "number") ? Fractional.from(note.beat, 0.0625) : null
        switch (note.type) {
            case "BPM": {
                note = note as NoteBPM
                if (beat === null) throw new Error("No beat value for timepoint")
                bpm.push({
                    beat,
                    value: note.bpm
                })
                break
            }
            case "Single": {
                note = note as NoteSingle
                if (beat === null) throw new Error("No beat value for note")
                const bgNote: BanGroundNote = {
                    type: note.flick ? "Flick" : "Single",
                    beat,
                    lane: note.lane,
                    tickStack: 0,
                    flags: 0
                }
                groups[0].notes.push(bgNote)
                break
            }
            case "Directional": {
                note = note as NoteDirectional
                if (beat === null) throw new Error("No beat value for note")
                const bgNote: BanGroundNote = {
                    type: "Flick",
                    beat,
                    lane: note.lane,
                    tickStack: 0,
                    flags: 0
                }
            }
            case "Long":
            case "Slide": {
                note = note as NoteSlide
                const connections = note.connections.filter((c, i, a) => i === 0 || i + 1 === a.length || !c.hidden)
                if (connections.length < 2) {
                    console.warn("A slide has less than 2 notes")
                    break
                }
                // 有效的 TickStack 是从 1 开始的
                const tickStackIndex: number = Object.keys(tickStacks).length + 1
                const tickStack = {
                    start: null,
                    end: null
                }
                connections.forEach((connection, index, array) => {
                    let bgNote: BanGroundNote = {
                        type: "Single",
                        beat: Fractional.from(connection.beat, 0.0625),
                        lane: connection.lane,
                        tickStack: tickStackIndex,
                        flags: 0
                    }
                    if (index === 0) {
                        bgNote.type = "Single"
                        tickStack.start = bgNote
                    } else if (index + 1 === array.length) {
                        bgNote.type = connection.flick ? "Flick" : "SlideTickEnd"
                        tickStack.end = bgNote
                    } else bgNote.type = "SlideTick"
                    groups[0].notes.push(bgNote)
                })
                break
            }
        }
    })
    return {groups, bpm}
}
