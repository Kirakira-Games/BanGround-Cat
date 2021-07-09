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
exports.BanGroundDifficultyC = exports.BanGroundDifficulty = void 0;
const compressing_1 = __importDefault(require("compressing"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../../index");
const util_1 = require("../util");
const CacheManager_1 = __importDefault(require("../CacheManager"));
const axios = axios_1.default.create();
exports.BanGroundDifficulty = [
    "easy",
    "normal",
    "hard",
    "expert",
    "special"
];
exports.BanGroundDifficultyC = [
    "Easy",
    "Normal",
    "Hard",
    "Expert",
    "Special"
];
function default_1(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheId = `${new Date().getTime()}${Math.floor(Math.random() * 10000)}`;
        const optDir = path_1.default.join(index_1.__cache_dir, `./kirapack/${cacheId}`);
        try {
            util_1.mkdirSync(optDir);
            util_1.mkdirSync(path_1.default.join(optDir, `./music/${data.id}`));
            util_1.mkdirSync(path_1.default.join(optDir, `./chart/${data.id}`));
            if (typeof data.audio === 'string') {
                if (!/^https?:\/\//.test(data.audio))
                    throw new Error("ERR_INVALID_AUDIO_URL");
                const audio = yield download(data.audio);
                if (audio)
                    data.audio = audio;
                else
                    throw new Error("ERR_DOWNLOAD_AUDIO_FAILED");
            }
            const songPath = CacheManager_1.default.put('./convert', `${cacheId}_aud`, data.audio);
            const convertedSongPath = path_1.default.join(optDir, `./music/${data.id}/${data.id}.ogg`);
            yield convertAudio(songPath, convertedSongPath);
            CacheManager_1.default.remove('./convert', `${cacheId}_aud`);
            if (typeof data.cover === 'string') {
                if (!/^https?:\/\//.test(data.cover)) {
                    data.cover = fs_1.default.readFileSync(path_1.default.join(index_1.__public_dir, "./img/default_cover.jpg"));
                    console.warn(`Invalid cover url: ${data.cover}, use default img instead.`);
                }
                else {
                    const cover = yield download(data.cover);
                    if (cover)
                        data.cover = cover;
                    else {
                        data.cover = fs_1.default.readFileSync(path_1.default.join(index_1.__public_dir, "./img/default_cover.jpg"));
                        console.warn(`Cannot download image from ${data.cover}, use default img instead.`);
                    }
                }
            }
            if (Buffer.isBuffer(data.cover)) {
                const coverPath = CacheManager_1.default.put('./convert', `${cacheId}_img`, data.cover);
                fs_1.default.writeFileSync(coverPath, data.cover);
                const convertedCoverPath = path_1.default.join(optDir, `./chart/${data.id}/bg.jpg`);
                yield convertImage(coverPath, convertedCoverPath);
                CacheManager_1.default.remove('./convert', `${cacheId}_img`);
            }
            if (typeof data.video === 'string') {
                if (!/^https?:\/\//.test(data.video)) {
                    console.warn(`Invalid video url: ${data.video}, no longer add video.`);
                }
                else {
                    const video = yield download(data.video);
                    if (video)
                        data.video = video;
                    else {
                        console.warn(`Cannot download video from ${data.video}, no longer add video.`);
                    }
                }
            }
            if (Buffer.isBuffer(data.video)) {
                const videoPath = CacheManager_1.default.put('./convert', `${cacheId}_vid`, data.video);
                fs_1.default.writeFileSync(videoPath, data.video);
                const convertedVideoPath = path_1.default.join(optDir, `./chart/${data.id}/vid.mp4`);
                yield convertVideo(videoPath, convertedVideoPath);
                CacheManager_1.default.remove('./convert', `${cacheId}_vid`);
            }
            const musicHeader = {
                mid: data.id,
                title: data.title,
                artist: data.artist,
                preview: data.preview,
                BPM: data.BPM,
                length: data.length
            };
            const difficulty = {};
            Object.keys(data.chart).forEach((k) => {
                difficulty[k] = data.chart[k].level;
            });
            const chartHeader = {
                version: 1,
                sid: data.id,
                mid: data.id,
                author: data.author,
                authorNick: data.authorNick,
                difficulty,
                backgroundFile: {
                    pic: "bg.jpg",
                    vid: data.video ? "vid.mp4" : undefined
                },
                preview: data.preview,
                tag: []
            };
            fs_1.default.writeFileSync(path_1.default.join(optDir, `./music/${data.id}/mheader.json`), JSON.stringify(musicHeader));
            fs_1.default.writeFileSync(path_1.default.join(optDir, `./chart/${data.id}/cheader.json`), JSON.stringify(chartHeader));
            for (const d in data.chart) {
                fs_1.default.writeFileSync(path_1.default.join(optDir, `./chart/${data.id}/${d}.json`), chartStringify(data.chart[d]));
            }
            util_1.mkdirSync(path_1.default.join(index_1.__cache_dir, `./kirapack`));
            const optFile = path_1.default.join(index_1.__cache_dir, `./kirapack/${cacheId}.kirapack`);
            return new Promise((resolve, reject) => {
                const compressStream = new compressing_1.default.zip.Stream();
                compressStream.addEntry(path_1.default.join(optDir, "./chart"));
                compressStream.addEntry(path_1.default.join(optDir, "./music"));
                compressStream.on("error", reject)
                    .pipe(fs_1.default.createWriteStream(optFile).on("error", reject))
                    .on("finish", () => {
                    resolve(optFile);
                });
            });
        }
        finally {
            CacheManager_1.default.remove(optDir);
        }
    });
}
exports.default = default_1;
function convertAudio(input, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield new Promise((resolve, reject) => {
                const ffmpegCommand = fluent_ffmpeg_1.default(input);
                if (process.platform === "win32" && fs_1.default.existsSync(path_1.default.join(index_1.__lib_dir, "./ffmpeg/bin/ffmpeg.exe")))
                    ffmpegCommand.setFfmpegPath(path_1.default.join(index_1.__lib_dir, "./ffmpeg/bin/ffmpeg.exe"));
                ffmpegCommand.inputOptions(['-vn'])
                    .audioCodec('libvorbis')
                    .audioBitrate(96)
                    .output(output)
                    .on('error', reject)
                    .on('end', resolve)
                    .run();
            });
        }
        catch (e) {
            console.error(e);
            throw new Error('ERR_CONVERT_AUDIO_FAILED');
        }
    });
}
function convertImage(input, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield new Promise((resolve, reject) => {
                const ffmpegCommand = fluent_ffmpeg_1.default(input);
                if (process.platform === "win32" && fs_1.default.existsSync(path_1.default.join(index_1.__lib_dir, "./ffmpeg/bin/ffmpeg.exe")))
                    ffmpegCommand.setFfmpegPath(path_1.default.join(index_1.__lib_dir, "./ffmpeg/bin/ffmpeg.exe"));
                ffmpegCommand.output(output)
                    .on('error', reject)
                    .on('end', resolve)
                    .run();
            });
        }
        catch (e) {
            console.error(e);
            throw new Error('ERR_CONVERT_COVER_FAILED');
        }
    });
}
function convertVideo(input, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield new Promise((resolve, reject) => {
                const ffmpegCommand = fluent_ffmpeg_1.default(input);
                if (process.platform === "win32" && fs_1.default.existsSync(path_1.default.join(index_1.__lib_dir, "./ffmpeg/bin/ffmpeg.exe")))
                    ffmpegCommand.setFfmpegPath(path_1.default.join(index_1.__lib_dir, "./ffmpeg/bin/ffmpeg.exe"));
                ffmpegCommand.inputOptions(['-vn'])
                    .noAudio()
                    .videoBitrate(512)
                    .fps(24)
                    .size("640x?")
                    .output(output)
                    .on('error', reject)
                    .on('end', resolve)
                    .run();
            });
        }
        catch (e) {
            console.error(e);
            throw new Error('ERR_CONVERT_AUDIO_FAILED');
        }
    });
}
function download(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios({
            method: "GET",
            url,
            responseType: "arraybuffer"
        });
        if (response.data)
            return Buffer.from(response.data);
    });
}
function chartStringify(chart) {
    const newChart = Object.assign(Object.assign({}, chart), { groups: chart.groups.map(g => {
            return Object.assign(Object.assign({}, g), { notes: g.notes.map(n => {
                    return Object.assign(Object.assign({}, n), { beat: n.beat.toArray() });
                }), points: g.points.map(p => {
                    return Object.assign(Object.assign({}, p), { beat: p.beat.toArray() });
                }) });
        }), bpm: chart.bpm.map(b => {
            return Object.assign(Object.assign({}, b), { beat: b.beat.toArray() });
        }) });
    return JSON.stringify(newChart);
}
