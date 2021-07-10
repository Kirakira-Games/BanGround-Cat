"use strict";
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
exports.getCoverUrl = exports.getAudioUrl = exports.getByLocale = exports.BandoriServerList = exports.BandoriServer = exports.mixLookupCharts = void 0;
const Bestdori_1 = __importDefault(require("./Bestdori"));
const util_1 = require("../util");
function mixLookupCharts(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const promiseOfficial = new Promise((resolve, reject) => {
            Bestdori_1.default.songs.song(id).then(resolve).catch(e => {
                if (e.isAxiosError && e.response && e.response.status === 404)
                    resolve(null);
                else
                    reject(e);
            });
        });
        const promiseCommunity = new Promise((resolve, reject) => {
            Bestdori_1.default.post.details(id).then(v => {
                if (v.post.categoryName === "SELF_POST")
                    resolve(v);
                else
                    resolve(null);
            }).catch(e => {
                if (e.toString().includes("REQUEST_INVALID"))
                    resolve(null);
                else
                    reject(e);
            });
        });
        const apiResults = yield Promise.all([promiseOfficial, promiseCommunity]);
        if (!apiResults[0] && !apiResults[1])
            return null;
        const result = {
            official: undefined,
            community: undefined
        };
        if (apiResults[0]) {
            const bands = yield Bestdori_1.default.bands.all();
            const unknownBand = ["未知のアーティスト", "Unknown Artist", "未知藝術家", "未知艺术家", "미 지 의 예술가"];
            const difficulties = [];
            for (const diff in apiResults[0].difficulty) {
                difficulties.push({
                    difficultyClass: parseInt(diff),
                    level: apiResults[0].difficulty[diff].playLevel,
                    publishedAt: (_a = apiResults[0].difficulty[diff].publishedAt) === null || _a === void 0 ? void 0 : _a.map(v => v ? parseInt(v) : null)
                });
            }
            result.official = {
                title: apiResults[0].musicTitle,
                band: bands[apiResults[0].bandId].bandName || unknownBand,
                composer: apiResults[0].composer,
                lyricist: apiResults[0].lyricist,
                arranger: apiResults[0].arranger,
                difficulties,
                publishedAt: apiResults[0].publishedAt.map(v => v ? parseInt(v) : null)
            };
        }
        if (apiResults[1]) {
            result.community = {
                title: apiResults[1].post.title,
                artists: apiResults[1].post.artists,
                author: apiResults[1].post.author,
                time: apiResults[1].post.time,
                difficultyClass: apiResults[1].post.diff,
                level: apiResults[1].post.level
            };
        }
        return result;
    });
}
exports.mixLookupCharts = mixLookupCharts;
var BandoriServer;
(function (BandoriServer) {
    BandoriServer[BandoriServer["jp"] = 0] = "jp";
    BandoriServer[BandoriServer["en"] = 1] = "en";
    BandoriServer[BandoriServer["tw"] = 2] = "tw";
    BandoriServer[BandoriServer["cn"] = 3] = "cn";
    BandoriServer[BandoriServer["kr"] = 4] = "kr";
})(BandoriServer = exports.BandoriServer || (exports.BandoriServer = {}));
exports.BandoriServerList = {
    0: "jp",
    1: "en",
    2: "tw",
    3: "cn",
    4: "kr"
};
const getByLocale = (array, locale) => array[locale] || array.filter(i => i)[0];
exports.getByLocale = getByLocale;
function getAudioUrl(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (payload.type === "custom")
            return payload.audio;
        else if (payload.type === "bandori") {
            const song = yield Bestdori_1.default.songs.song(payload.id);
            const serverName = exports.BandoriServerList[util_1.firstNotNullIndex(song.publishedAt)];
            // https://bestdori.com/assets/cn/sound/bgm128_rip/bgm128.mp3
            return `https://bestdori.com/assets/${serverName}/sound/bgm${payload.id}_rip/bgm${payload.id}.mp3`;
        }
        else if (payload.type === "llsif") {
            const llsifList = yield Bestdori_1.default.misc.llsif();
            if (!llsifList[payload.id])
                throw new Error("ERR_LLSIF_SONG_NOT_EXISTS");
            return `https://card.niconi.co.ni/asset/${llsifList[payload.id].sound}`;
        }
        return null;
    });
}
exports.getAudioUrl = getAudioUrl;
function getCoverUrl(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (payload.type === "custom")
            return payload.cover;
        else if (payload.type === "bandori") {
            const song = yield Bestdori_1.default.songs.song(payload.id);
            const serverName = exports.BandoriServerList[util_1.firstNotNullIndex(song.publishedAt)];
            // https://bestdori.com/assets/en/musicjacket/musicjacket1010_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket1010-1001_saikou_eng-jacket.png
            const ceil = Math.ceil(payload.id / 10) * 10;
            return `https://bestdori.com/assets/${serverName}/musicjacket/musicjacket${ceil}_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket${ceil}-${song.jacketImage[0]}-jacket.png`;
        }
        else if (payload.type === "llsif") {
            const llsifList = yield Bestdori_1.default.misc.llsif();
            if (!llsifList[payload.id])
                throw new Error("ERR_LLSIF_SONG_NOT_EXISTS");
            return `https://card.niconi.co.ni/asset/${llsifList[payload.id].icon}`;
        }
        return null;
    });
}
exports.getCoverUrl = getCoverUrl;
