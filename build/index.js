"use strict";
// TODO: 我没有i83n，懒了懒了
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__root_dir = exports.__lib_dir = exports.__public_dir = exports.__cache_dir = exports.__data_dir = void 0;
const koishi_core_1 = require("koishi-core");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/* Import adapters */
require("koishi-adapter-onebot");
require("koishi-adapter-discord");
require("koishi-adapter-telegram");
require("koishi-adapter-kaiheila");
/* Export work directories */
exports.__data_dir = path_1.default.join(__dirname, "/../data");
exports.__cache_dir = path_1.default.join(__dirname, "/../cache");
exports.__public_dir = path_1.default.join(__dirname, "/../public");
exports.__lib_dir = path_1.default.join(__dirname, "/../lib");
exports.__root_dir = path_1.default.join(__dirname, "/..");
/* Create work directories */
fs_1.default.mkdir(exports.__data_dir, () => { });
fs_1.default.mkdir(exports.__cache_dir, () => { });
fs_1.default.mkdir(exports.__public_dir, () => { });
/* Load bot data */
const botData = (function () {
    try {
        const file = fs_1.default.readFileSync(path_1.default.join(exports.__data_dir, "/config.json"), "utf-8");
        const options = Object.assign({}, JSON.parse(file));
        return options;
    }
    catch (e) {
        console.error("! No bot data, please check README.md for help.");
        process.exit(-1);
    }
})();
/* Create application */
const app = new koishi_core_1.App(botData);
/* Import custom plugins */
app.plugin(require("./plugins/bd2bg"));
/* Start bot application */
app.start().then(() => {
    console.log("* BanGround Neko Bot Application started!");
}).catch(e => {
    console.error("! Start BanGround Neko Bot Application failed...");
    console.error(e.stackTrace || e);
});
