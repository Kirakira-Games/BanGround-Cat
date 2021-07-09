"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = void 0;
const BestdoriUtil_1 = require("../../lib/api/BestdoriUtil");
const util_1 = require("../../lib/util");
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../../index");
const Bestdori_1 = __importDefault(require("../../lib/api/Bestdori"));
const kirapackUtil_1 = require("../../lib/service/kirapackUtil");
const kirapack_1 = __importStar(require("../../lib/service/kirapack"));
const path_1 = __importDefault(require("path"));
const defaultOptions = {};
function apply(ctx, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        options = Object.assign(Object.assign({}, defaultOptions), options);
        const kiraconf = JSON.parse(fs_1.default.readFileSync(path_1.default.join(index_1.__data_dir, "./kiraconf.json"), "utf-8"));
        const command = ctx.command("bd2bg", "Bestdori 转 BanGround 插件");
        /* 创建工作目录 */
        fs_1.default.mkdir(index_1.__data_dir + "/kirapack", () => { });
        fs_1.default.mkdir(index_1.__data_dir + "/cache", () => { });
        command.subcommand("convert <id: number>", "转换 Bestdori 谱面到 BanGround 的谱面并打包")
            .shortcut("kirapack", { fuzzy: true })
            .option("cover", "-c <url: string> 生成时替换目标曲目封面")
            .option("video", "-v <url: string> 生成时为曲目添加背景视频")
            .option("preview", "-p <start: number> <end: number> 指定预览区间，单位为秒")
            .option("regenerate", "-r 删除已生成的kirapack缓存来重新生成")
            .usage(() => "使用示例：\r" +
            "打包官谱《六兆年と一夜物語》：\r" +
            "kirapack 128\r" +
            "\r" +
            "打包Bestdori社区ID为19078的谱面：\r" +
            "kirapack 19078\r" +
            "\r" +
            "打包Bestdori社区ID为41131的谱面，同时添加背景视频：\r" +
            "kirapack 41131 -v https://example.com/example.mp4")
            .action((argv, id, args) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            if (id === null || id === undefined)
                return util_1.withQuote((_a = argv.session) === null || _a === void 0 ? void 0 : _a.messageId, "使用示例：kirapack 128");
            if (typeof id !== "number" || id <= 0)
                return util_1.withQuote((_b = argv.session) === null || _b === void 0 ? void 0 : _b.messageId, "您提供的ID无效，请确认后再试。");
            const timer = setTimeout(() => {
                var _a, _b;
                (_a = argv.session) === null || _a === void 0 ? void 0 : _a.send(util_1.withQuote((_b = argv.session) === null || _b === void 0 ? void 0 : _b.messageId, `正在为您查询 ID 为 ${id} 的谱面，请稍候……`)).catch(console.error);
            }, 3000);
            const chart = yield BestdoriUtil_1.mixLookupCharts(id);
            clearTimeout(timer);
            if (!chart)
                return util_1.withQuote((_c = argv.session) === null || _c === void 0 ? void 0 : _c.messageId, `ID 为 ${id} 的谱面不存在，请检查后再试。`);
            if (chart.official) {
                return "是官谱啊喵？咕咕咕咕咕咕";
                if (!fs_1.default.existsSync(index_1.__data_dir + `/kirapack/official_${id}.kirapack`)) {
                    (_d = argv.session) === null || _d === void 0 ? void 0 : _d.send(util_1.withQuote((_e = argv.session) === null || _e === void 0 ? void 0 : _e.messageId, `正在为您打包生成 ${BestdoriUtil_1.getByLocale(chart.official.title, BestdoriUtil_1.BandoriServer.cn)}，请稍候……`)).catch(console.error);
                }
                (_f = argv.session) === null || _f === void 0 ? void 0 : _f.send(util_1.withQuote((_g = argv.session) === null || _g === void 0 ? void 0 : _g.messageId, `↓↓↓复制下方链接到浏览器以下载 [${id}]${BestdoriUtil_1.getByLocale(chart.official.title, BestdoriUtil_1.BandoriServer.cn)}`)).catch(console.error);
            }
            if (chart.community) {
                if (!fs_1.default.existsSync(index_1.__data_dir + `/kirapack/community_${id}.kirapack`)) {
                    (_h = argv.session) === null || _h === void 0 ? void 0 : _h.send(util_1.withQuote((_j = argv.session) === null || _j === void 0 ? void 0 : _j.messageId, `正在为您打包生成 ${chart.community.title}，请稍候……`)).catch(console.error);
                    {
                        const details = yield Bestdori_1.default.post.details(id);
                        const chartNotes = details.post.chart;
                        const convertedChart = kirapackUtil_1.bd2bg(chartNotes);
                        const BPMs = chartNotes.filter(n => n.type === "BPM");
                        BPMs.sort((a, b) => a.bpm - b.bpm);
                        const chart = {};
                        chart[kirapack_1.BanGroundDifficulty[details.post.diff]] = Object.assign({ version: 2, difficulty: kirapack_1.BanGroundDifficultyC[details.post.diff], level: details.post.level, offset: 0 }, convertedChart);
                        const optPath = yield kirapack_1.default({
                            id,
                            title: details.post.title,
                            artist: details.post.artists,
                            author: details.post.author.username,
                            authorNick: details.post.author.nickname || details.post.author.username,
                            preview: [0, 0],
                            BPM: [BPMs[0].bpm, BPMs[BPMs.length - 1].bpm],
                            length: 0,
                            audio: yield BestdoriUtil_1.getAudioUrl(details.post.song),
                            cover: yield BestdoriUtil_1.getCoverUrl(details.post.song),
                            chart,
                            tag: []
                        });
                        fs_1.default.renameSync(optPath, path_1.default.join(index_1.__data_dir, `./kirapack/community_${id}.kirapack`));
                    }
                }
                yield ((_k = argv.session) === null || _k === void 0 ? void 0 : _k.send(util_1.withQuote((_l = argv.session) === null || _l === void 0 ? void 0 : _l.messageId, `↓↓↓复制下方链接到浏览器以下载 [${id}]${chart.community.title}`)).catch(console.error));
                yield ((_m = argv.session) === null || _m === void 0 ? void 0 : _m.send(util_1.withQuote((_o = argv.session) === null || _o === void 0 ? void 0 : _o.messageId, `${kiraconf.kirapack.baseURL}${kiraconf.kirapack.baseURL.endsWith("/") ? "" : "/"}community_${id}.kirapack`)).catch(console.error));
            }
            return "";
        }));
    });
}
exports.apply = apply;
