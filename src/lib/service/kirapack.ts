import compressing from "compressing";
import FluentFFMpeg from "fluent-ffmpeg";
import Axios, {AxiosResponse} from "axios";
import fs from "fs";
import path from "path";
import {__cache_dir, __data_dir, __lib_dir, __public_dir, __root_dir} from "../../index";
import {filter, mkdirSync} from "../util";
import CacheManager from "../CacheManager";
import {Bpm, Group} from "../entity/BanGround";

const axios = Axios.create();

export interface MusicHeader {
    mid: number
    title: string
    artist: string
    preview: [number, number]
    BPM: [number, number]
    length: number
}

export interface ChartHeader {
    version: number
    sid: number
    mid: number
    author: string
    authorNick: string
    difficulty: {
        easy?: number
        normal?: number
        hard?: number
        expert?: number
        special?: number
    }
    backgroundFile: {
        pic?: string
        vid?: string
    }
    preview: [number, number]
    tag: string[]
}

export type BanGroundDiff = "easy" | "normal" | "hard" | "expert" | "special"
export const BanGroundDifficulty = [
    "easy",
    "normal",
    "hard",
    "expert",
    "special"
]
export const BanGroundDifficultyC = [
    "Easy",
    "Normal",
    "Hard",
    "Expert",
    "Special"
]

export interface BanGroundChart {
    version: 2
    difficulty: string,
    level: number,
    offset: number,
    groups: Group[],
    bpm: Bpm[]
}

export default async function (data: {
    id: number,
    title: string,
    artist: string,
    author: string,
    authorNick: string,
    preview: [number, number],
    BPM: [number, number],
    length: number,
    audio: string | Buffer,
    cover?: string | Buffer | null,
    video?: string | Buffer | null,
    chart: Record<BanGroundDiff, BanGroundChart>
    tag: string[]
}): Promise<string> {
    const cacheId = `${new Date().getTime()}${Math.floor(Math.random() * 10000)}`
    const optDir = path.join(__cache_dir, `./kirapack/${cacheId}`)
    try {
        mkdirSync(optDir)
        mkdirSync(path.join(optDir, `./music/${data.id}`))
        mkdirSync(path.join(optDir, `./chart/${data.id}`))

        if (typeof data.audio === 'string') {
            if (!/^https?:\/\//.test(data.audio)) throw new Error("ERR_INVALID_AUDIO_URL")
            const audio = await download(data.audio)
            if (audio) data.audio = audio
            else throw new Error("ERR_DOWNLOAD_AUDIO_FAILED")
        }
        const songPath = CacheManager.put('./convert', `${cacheId}_aud`, data.audio)
        const convertedSongPath = path.join(optDir, `./music/${data.id}/${data.id}.ogg`)
        await convertAudio(songPath, convertedSongPath)
        CacheManager.remove('./convert', `${cacheId}_aud`)

        if (typeof data.cover === 'string') {
            if (!/^https?:\/\//.test(data.cover)) {
                data.cover = fs.readFileSync(path.join(__public_dir, "./img/default_cover.jpg"))
                console.warn(`Invalid cover url: ${data.cover}, use default img instead.`)
            } else {
                const cover = await download(data.cover)
                if (cover) data.cover = cover
                else {
                    data.cover = fs.readFileSync(path.join(__public_dir, "./img/default_cover.jpg"))
                    console.warn(`Cannot download image from ${data.cover}, use default img instead.`)
                }
            }
        }
        if (Buffer.isBuffer(data.cover)) {
            const coverPath = CacheManager.put('./convert', `${cacheId}_img`, data.cover)
            fs.writeFileSync(coverPath, data.cover)
            const convertedCoverPath = path.join(optDir, `./chart/${data.id}/bg.jpg`)
            await convertImage(coverPath, convertedCoverPath)
            CacheManager.remove('./convert', `${cacheId}_img`)
        }

        if (typeof data.video === 'string') {
            if (!/^https?:\/\//.test(data.video)) {
                console.warn(`Invalid video url: ${data.video}, no longer add video.`)
            } else {
                const video = await download(data.video)
                if (video) data.video = video
                else {
                    console.warn(`Cannot download video from ${data.video}, no longer add video.`)
                }
            }
        }
        if (Buffer.isBuffer(data.video)) {
            const videoPath = CacheManager.put('./convert', `${cacheId}_vid`, data.video)
            fs.writeFileSync(videoPath, data.video)
            const convertedVideoPath = path.join(optDir, `./chart/${data.id}/vid.mp4`)
            await convertVideo(videoPath, convertedVideoPath)
            CacheManager.remove('./convert', `${cacheId}_vid`)
        }

        const musicHeader: MusicHeader = {
            mid: data.id,
            title: data.title,
            artist: data.artist,
            preview: data.preview,
            BPM: data.BPM,
            length: data.length
        }

        const difficulty: {} = {}
        Object.keys(data.chart).forEach((k: BanGroundDiff) => {
            difficulty[k] = data.chart[k].level
        })
        const chartHeader: ChartHeader = {
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
        }

        fs.writeFileSync(path.join(optDir, `./music/${data.id}/mheader.json`), JSON.stringify(musicHeader))
        fs.writeFileSync(path.join(optDir, `./chart/${data.id}/cheader.json`), JSON.stringify(chartHeader))

        for (const d in data.chart) {
            fs.writeFileSync(path.join(optDir, `./chart/${data.id}/${d}.json`), chartStringify(data.chart[d]))
        }

        mkdirSync(path.join(__cache_dir, `./kirapack`))
        const optFile = path.join(__cache_dir, `./kirapack/${cacheId}.kirapack`)

        return new Promise((resolve, reject) => {
            const compressStream = new compressing.zip.Stream()
            compressStream.addEntry(path.join(optDir, "./chart"))
            compressStream.addEntry(path.join(optDir, "./music"))
            compressStream.on("error", reject)
                .pipe(fs.createWriteStream(optFile).on("error", reject))
                .on("finish", () => {
                    resolve(optFile)
                })
        })
    } finally {
        CacheManager.remove(optDir)
    }
}

async function convertAudio(input, output): Promise<void> {
    try {
        await new Promise((resolve, reject) => {
            const ffmpegCommand = FluentFFMpeg(input)
            if (process.platform === "win32" && fs.existsSync(path.join(__lib_dir, "./ffmpeg/bin/ffmpeg.exe")))
                ffmpegCommand.setFfmpegPath(path.join(__lib_dir, "./ffmpeg/bin/ffmpeg.exe"))
            ffmpegCommand.inputOptions(['-vn'])
                .audioCodec('libvorbis')
                .audioBitrate(96)
                .output(output)
                .on('error', reject)
                .on('end', resolve)
                .run()
        })
    } catch (e) {
        console.error(e)
        throw new Error('ERR_CONVERT_AUDIO_FAILED')
    }
}

async function convertImage(input, output): Promise<void> {
    try {
        await new Promise((resolve, reject) => {
            const ffmpegCommand = FluentFFMpeg(input)
            if (process.platform === "win32" && fs.existsSync(path.join(__lib_dir, "./ffmpeg/bin/ffmpeg.exe")))
                ffmpegCommand.setFfmpegPath(path.join(__lib_dir, "./ffmpeg/bin/ffmpeg.exe"))
            ffmpegCommand.output(output)
                .on('error', reject)
                .on('end', resolve)
                .run()
        })
    } catch (e) {
        console.error(e)
        throw new Error('ERR_CONVERT_COVER_FAILED')
    }
}

async function convertVideo(input, output): Promise<void> {
    try {
        await new Promise((resolve, reject) => {
            const ffmpegCommand = FluentFFMpeg(input)
            if (process.platform === "win32" && fs.existsSync(path.join(__lib_dir, "./ffmpeg/bin/ffmpeg.exe")))
                ffmpegCommand.setFfmpegPath(path.join(__lib_dir, "./ffmpeg/bin/ffmpeg.exe"))
            ffmpegCommand.inputOptions(['-vn'])
                .noAudio()
                .videoBitrate(512)
                .fps(24)
                .size("640x?")
                .output(output)
                .on('error', reject)
                .on('end', resolve)
                .run()
        })
    } catch (e) {
        console.error(e)
        throw new Error('ERR_CONVERT_AUDIO_FAILED')
    }
}

async function download(url: string): Promise<Buffer | void> {
    const response: AxiosResponse<ArrayBuffer> = await axios({
        method: "GET",
        url: filter(url),
        responseType: "arraybuffer"
    })
    if (response.data) return Buffer.from(response.data)
}

function chartStringify(chart: BanGroundChart): string {
    const newChart = {
        ...chart,
        groups: chart.groups.map(g => {
            return {
                ...g,
                notes: g.notes.map(n => {
                    return {
                        ...n,
                        beat: n.beat.toArray()
                    }
                }),
                points: g.points.map(p => {
                    return {
                        ...p,
                        beat: p.beat.toArray()
                    }
                })
            }
        }),
        bpm: chart.bpm.map(b => {
            return {
                ...b,
                beat: b.beat.toArray()
            }
        })
    }
    return JSON.stringify(newChart)
}
