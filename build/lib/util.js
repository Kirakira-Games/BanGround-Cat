"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstNotNullIndex = exports.unlinkDirSync = exports.mkdirSync = exports.Fractional = exports.decimalsToFractional = exports.withQuote = void 0;
const koishi_utils_1 = require("koishi-utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function withQuote(messageId, content) {
    return koishi_utils_1.segment("quote", { id: messageId }) + "\r" + content;
}
exports.withQuote = withQuote;
function decimalsToFractional(decimals, accuracy = 0.0625) {
    const lowerLimitOfError = 9999999999, continuedFraction = 16;
    if (Number.isInteger(decimals))
        return [decimals, 0, 1];
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
            if (Math.abs(remainder * lowerLimitOfError) < 1)
                break;
            reciprocal = 1 / remainder;
            reciprocalInteger = Math.floor(reciprocal);
            if (reciprocalInteger < 1)
                break;
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
        if (Math.abs(error) < Math.abs(accuracy))
            break;
        if (Math.abs(error * lowerLimitOfError) < 1)
            break;
    }
    return [Math.floor(numerator / denominator) * (isPositive ? 1 : -1), Math.round(numerator % denominator), (numerator % denominator === 0) ? 1 : Math.round(denominator)];
}
exports.decimalsToFractional = decimalsToFractional;
class Fractional {
    constructor(integer, numerator, denominator) {
        if (integer instanceof Fractional) {
            this.Integer = integer.integer;
            this.Numerator = integer.numerator;
            this.Denominator = integer.denominator;
        }
        else if (Array.isArray(integer) && integer.length === 3) {
            this.Integer = integer[0];
            this.Numerator = integer[1];
            this.Denominator = integer[2];
        }
        else if (typeof integer === "number" && Number.isInteger(integer) && Number.isInteger(numerator) && Number.isInteger(denominator)) {
            this.Integer = integer;
            this.Numerator = numerator;
            this.Denominator = denominator;
        }
        else
            throw new Error("Invalid input of fractional");
        if (this.Denominator === 0)
            throw new Error("Denominator cannot be 0");
        if (this.Numerator > this.Denominator) {
            this.Integer += Math.floor(this.Numerator / this.Denominator);
            this.Numerator = this.Numerator % this.Denominator;
        }
    }
    set integer(integer) {
        if (!Number.isInteger(integer))
            throw new Error("Invalid input of integer");
        this.Integer = integer;
    }
    get integer() {
        return this.Integer;
    }
    set numerator(numerator) {
        if (!Number.isInteger(numerator))
            throw new Error("Invalid input of numerator");
        this.Numerator = numerator;
    }
    get numerator() {
        return this.Numerator;
    }
    set denominator(denominator) {
        if (!Number.isInteger(denominator))
            throw new Error("Invalid input of denominator");
        else if (denominator === 0)
            throw new Error("Denominator cannot be 0");
        this.Denominator = denominator;
    }
    get denominator() {
        return this.Denominator;
    }
    toNumber() {
        return this.Integer + this.Numerator / this.Denominator;
    }
    /**
     * @returns {[number, number, number]} - [integer, numerator, denominator]
     */
    toArray() {
        return [this.Integer, this.Numerator, this.Denominator];
    }
    static from(number, accuracy = 0.0625) {
        return new Fractional(decimalsToFractional(number, accuracy));
    }
    toString() {
        return this.toArray().toString();
    }
}
exports.Fractional = Fractional;
function mkdirSync(dirPath) {
    if (dirPath == null || dirPath == "")
        return;
    dirPath = isAbsolute(dirPath) ? path_1.default.normalize(dirPath) : path_1.default.join(process.cwd(), dirPath);
    if (fs_1.default.existsSync(dirPath))
        return;
    const arr = dirPath.split(path_1.default.sep);
    let index = arr.length - 1;
    let tempStr = arr[index];
    while (tempStr == "" && arr.length > 0) {
        index--;
        tempStr = arr[index];
    }
    if (tempStr == "")
        return;
    const newPath = dirPath.substring(0, dirPath.length - tempStr.length - 1);
    if (!fs_1.default.existsSync(newPath))
        mkdirSync(newPath);
    fs_1.default.mkdirSync(dirPath);
}
exports.mkdirSync = mkdirSync;
function isAbsolute(filePath) {
    filePath = path_1.default.normalize(filePath);
    if (filePath.substring(0, 1) == "/")
        return true;
    if (filePath.search(/[\w]+:/) == 0)
        return true;
    return false;
}
function unlinkDirSync(dir) {
    let files = [];
    if (fs_1.default.existsSync(dir)) {
        files = fs_1.default.readdirSync(dir);
        files.forEach(function (file, index) {
            const curPath = path_1.default.join(dir, file);
            if (fs_1.default.statSync(curPath).isDirectory()) {
                unlinkDirSync(curPath);
            }
            else {
                fs_1.default.unlinkSync(curPath);
            }
        });
        fs_1.default.rmdirSync(dir);
    }
}
exports.unlinkDirSync = unlinkDirSync;
;
function firstNotNullIndex(obj) {
    for (const i in obj)
        if (obj[i])
            return i;
    return null;
}
exports.firstNotNullIndex = firstNotNullIndex;
