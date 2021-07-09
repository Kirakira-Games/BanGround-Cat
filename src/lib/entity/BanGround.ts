import {Fractional} from "../util";

export interface Bpm {
    beat: Fractional
    value: number
}

export interface Group {
    notes: Array<Note>
    points: Array<Point>
    flags: number
}

export interface Note {
    type: "Single" | "Flick" | "SlideTick" | "SlideTickEnd"
    beat: Fractional
    lane: number // 0-6
    tickStack: number // == 0 for not in slide, > 0 for in which slide
    flags: number
}

export interface Point {
    beat: Fractional
    speed: {
        value: number
        transition: number
    }
    tap: PointColor
    tapGrey: PointColor
    flick: PointColor
    slideTick: PointColor
    slide: PointColor
}

export interface PointColor {
    r: number
    g: number
    b: number
    a: number
    transition: number
}
