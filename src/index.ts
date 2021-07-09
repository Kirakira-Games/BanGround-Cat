// TODO: 我没有i83n，懒了懒了

import {App, AppOptions} from "koishi-core"
import fs from "fs"
import path from "path"

/* Import adapters */
import "koishi-adapter-onebot"
import "koishi-adapter-discord"
import "koishi-adapter-telegram"
import "koishi-adapter-kaiheila"

/* Export work directories */
export const __data_dir = path.join(__dirname, "/../data")
export const __cache_dir = path.join(__dirname, "/../cache")
export const __public_dir = path.join(__dirname, "/../public")
export const __lib_dir = path.join(__dirname, "/../lib")
export const __root_dir = path.join(__dirname, "/..")

/* Create work directories */
fs.mkdir(__data_dir, () => {})
fs.mkdir(__cache_dir, () => {})
fs.mkdir(__public_dir, () => {})

/* Load bot data */
const botData: AppOptions = (function () {
    try {
        const file: string = fs.readFileSync(path.join(__data_dir, "/config.json"), "utf-8")
        const options = {
            ...JSON.parse(file)
        }
        return options
    } catch (e) {
        console.error("! No bot data, please check README.md for help.")
        process.exit(-1)
    }
})()

/* Create application */
const app: App = new App(botData)

/* Import custom plugins */
app.plugin(require("./plugins/bd2bg"))

/* Start bot application */
app.start().then(() => {
    console.log("* BanGround Neko Bot Application started!")
}).catch(e => {
    console.error("! Start BanGround Neko Bot Application failed...")
    console.error(e.stackTrace || e)
})
