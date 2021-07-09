import {segment} from "koishi-utils"
import path from "path";
import fs from "fs";

export function withQuote(messageId: string, content: any): string {
    return segment("quote", {id: messageId}) + "\r" + content
}

const {Argv} = require("koishi-core")
type Argv = typeof Argv
export function withQuoteBySession(argv: Argv, content: string | number | boolean) {
    if (argv.session.platform === "onebot" && argv.session.subtype === "group")
        return segment("quote", { id: argv.session.messageId }) +
            segment("at", { id: argv.session.userId }) +
            " " +
            content
    return withQuote(argv.session.messageId, content)
}

export function decimalsToFractional(decimals: number, accuracy: number = 0.0625): [number, number, number] {
    const lowerLimitOfError = 9999999999, continuedFraction = 16;
    if (Number.isInteger(decimals)) return [decimals, 0, 1];
    let isPositive = true, target = decimals;
    if (target === 0 || Math.abs((target - Math.floor(target))) * lowerLimitOfError < 1) {
        return [0, 0, 1];
    }
    let denominators = new Array(continuedFraction + 1);
    if (target < 0) {
        target = -target;
        isPositive = false;
    }
    const integer = Math.floor(target);
    let numerator, denominator, error = target - integer;
    let remainder = error, n;
    if (Math.abs(remainder * lowerLimitOfError) > 1) {
        let reciprocal = 1 / remainder;
        let reciprocalInteger = Math.floor(reciprocal);
        remainder = reciprocal - reciprocalInteger;
        denominators[0] = reciprocalInteger;
        for (n = 1; n <= continuedFraction; n++) {
            if (Math.abs(remainder * lowerLimitOfError) < 1) break;
            reciprocal = 1 / remainder;
            reciprocalInteger = Math.floor(reciprocal);
            if (reciprocalInteger < 1) break;
            denominators[n] = reciprocal;
            remainder = reciprocal - reciprocalInteger;
        }
    }
    for (let m = 0; m < n; m++) {
        numerator = 1;
        denominator = denominators[m];
        for (let i = m - 1; i >= 0; i--) {
            const newNumerator = denominator;
            denominator = denominators[i] * denominator + numerator;
            numerator = newNumerator;
        }
        numerator = numerator + integer * denominator;
        error = target - numerator / denominator;
        if (Math.abs(error) < Math.abs(accuracy)) break;
        if (Math.abs(error * lowerLimitOfError) < 1) break;
    }
    return [Math.floor(numerator / denominator) * (isPositive ? 1 : -1), Math.round(numerator % denominator), (numerator % denominator === 0) ? 1 : Math.round(denominator)];
}


export class Fractional {
    private Integer: number
    private Numerator: number
    private Denominator: number


    constructor(fractional: Fractional)
    constructor(fractional: [number, number, number]) // [integer, numerator, denominator]
    constructor(integer: number | [number, number, number], numerator: number, denominator: number)
    constructor(integer: Fractional | number | [number, number, number], numerator?: number, denominator?: number) {
        if (integer instanceof Fractional) {
            this.Integer = integer.integer
            this.Numerator = integer.numerator
            this.Denominator = integer.denominator
        } else if (Array.isArray(integer) && integer.length === 3) {
            this.Integer = integer[0]
            this.Numerator = integer[1]
            this.Denominator = integer[2]
        } else if (typeof integer === "number" && Number.isInteger(integer) && Number.isInteger(numerator) && Number.isInteger(denominator)) {
            this.Integer = integer
            this.Numerator = numerator
            this.Denominator = denominator
        } else throw new Error("Invalid input of fractional")
        if (this.Denominator === 0) throw new Error("Denominator cannot be 0")
        if (this.Numerator > this.Denominator) {
            this.Integer += Math.floor(this.Numerator / this.Denominator)
            this.Numerator = this.Numerator % this.Denominator
        }
    }

    public set integer(integer) {
        if (!Number.isInteger(integer)) throw new Error("Invalid input of integer")
        this.Integer = integer
    }

    public get integer(): number {
        return this.Integer
    }

    public set numerator(numerator) {
        if (!Number.isInteger(numerator)) throw new Error("Invalid input of numerator")
        this.Numerator = numerator
    }

    public get numerator(): number {
        return this.Numerator
    }

    public set denominator(denominator) {
        if (!Number.isInteger(denominator)) throw new Error("Invalid input of denominator")
        else if (denominator === 0) throw new Error("Denominator cannot be 0")
        this.Denominator = denominator
    }

    public get denominator(): number {
        return this.Denominator
    }

    public toNumber(): number {
        return this.Integer + this.Numerator / this.Denominator
    }

    /**
     * @returns {[number, number, number]} - [integer, numerator, denominator]
     */
    public toArray(): [number, number, number] {
        return [this.Integer, this.Numerator, this.Denominator]
    }

    public static from(number: number, accuracy: number = 0.0625): Fractional {
        return new Fractional(decimalsToFractional(number, accuracy))
    }

    public toString(): string {
        return this.toArray().toString()
    }
}

export function mkdirSync(dirPath: string) {
    if (dirPath == null || dirPath == "") return;
    dirPath = isAbsolute(dirPath) ? path.normalize(dirPath) : path.join(process.cwd(), dirPath);
    if (fs.existsSync(dirPath)) return;

    const arr = dirPath.split(path.sep);
    let index = arr.length - 1;
    let tempStr = arr[index];
    while (tempStr == "" && arr.length > 0) {
        index--;
        tempStr = arr[index];
    }
    if (tempStr == "") return;
    const newPath = dirPath.substring(0, dirPath.length - tempStr.length - 1);
    if (!fs.existsSync(newPath)) mkdirSync(newPath);
    fs.mkdirSync(dirPath);
}

function isAbsolute(filePath: string) {
    filePath = path.normalize(filePath);
    if (filePath.substring(0, 1) == "/") return true;
    if (filePath.search(/[\w]+:/) == 0) return true;
    return false;
}

export function unlinkDirSync(dir: string) {
    let files = [];
    if (fs.existsSync(dir)) {
        files = fs.readdirSync(dir);
        files.forEach(function (file, index) {
            const curPath = path.join(dir, file);
            if (fs.statSync(curPath).isDirectory()) {
                unlinkDirSync(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
};

export function firstNotNullIndex(obj: Record<any, any> | any[]): string | null {
    for (const i in obj) if (obj[i]) return i
    return null
}
