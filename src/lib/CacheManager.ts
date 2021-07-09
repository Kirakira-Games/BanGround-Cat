import {mkdirSync, unlinkDirSync} from "./util";
import {__cache_dir} from "../index";
import path from "path";
import fs from "fs";

export default class CacheManager {
    public static getPath(dir: string, file?: string) {
        if (file) return path.join(__cache_dir, dir, file)
        else return path.join(__cache_dir, dir)
    }

    public static put(dir: string, file: string, data: Buffer | string): string {
        mkdirSync(path.join(__cache_dir, dir))
        fs.writeFileSync(this.getPath(dir, file), data)
        return this.getPath(dir, file)
    }

    public static has(dir: string, file: string): boolean {
        return fs.existsSync(this.getPath(dir, file))
    }

    public static get(dir: string, file: string, options?: any): Buffer | string | null {
        if (!this.has(dir, file)) return null
        return fs.readFileSync(this.getPath(dir, file), options)
    }

    public static remove(dir: string, file?: string) {
        if (file) fs.unlinkSync(this.getPath(dir, file))
        else unlinkDirSync(this.getPath(dir))
    }
}
