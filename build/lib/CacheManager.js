"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const index_1 = require("../index");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class CacheManager {
    static getPath(dir, file) {
        if (file)
            return path_1.default.join(index_1.__cache_dir, dir, file);
        else
            return path_1.default.join(index_1.__cache_dir, dir);
    }
    static put(dir, file, data) {
        util_1.mkdirSync(path_1.default.join(index_1.__cache_dir, dir));
        fs_1.default.writeFileSync(this.getPath(dir, file), data);
        return this.getPath(dir, file);
    }
    static has(dir, file) {
        return fs_1.default.existsSync(this.getPath(dir, file));
    }
    static get(dir, file, options) {
        if (!this.has(dir, file))
            return null;
        return fs_1.default.readFileSync(this.getPath(dir, file), options);
    }
    static remove(dir, file) {
        if (file)
            fs_1.default.unlinkSync(this.getPath(dir, file));
        else
            util_1.unlinkDirSync(this.getPath(dir));
    }
}
exports.default = CacheManager;
