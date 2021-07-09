import {Context} from "koishi-core"
import {BandoriServer, getAudioUrl, getByLocale, getCoverUrl, mixLookupCharts} from "../../lib/api/BestdoriUtil"
import {withQuoteBySession} from "../../lib/util"
import fs from "fs"
import {__data_dir} from "../../index";
import BestdoriAPI, {NoteBPM} from "../../lib/api/Bestdori";
import {bd2bg} from "../../lib/service/kirapackUtil";
import kirapack, {BanGroundChart, BanGroundDifficulty, BanGroundDifficultyC} from "../../lib/service/kirapack";
import path from "path";

declare module "koishi-core" {}

export interface Config {}

const defaultOptions = {}

export async function apply(ctx: Context, options: Config = {}) {
    options = {
        ...defaultOptions,
        ...options
    }

    interface KiraConf {
        kirapack: {
            baseURL: string
        }
    }
    const kiraconf: KiraConf =
        JSON.parse(fs.readFileSync(path.join(__data_dir, "./kiraconf.json"), "utf-8")) as KiraConf

    const command = ctx.command("bd2bg", "Bestdori 转 BanGround 插件")

    /* 创建工作目录 */
    fs.mkdir(__data_dir + "/kirapack", () => {})
    fs.mkdir(__data_dir + "/cache", () => {})
    command.subcommand("convert <id: number>", "转换 Bestdori 谱面到 BanGround 的谱面并打包")
        .shortcut("kirapack", { fuzzy: true })
        .option("cover", "-c <url: string> 生成时替换目标曲目封面")
        .option("video", "-v <url: string> 生成时为曲目添加背景视频")
        .option("preview", "-p <start: number> <end: number> 指定预览区间，单位为秒")
        .option("regenerate", "-r 删除已生成的kirapack缓存来重新生成")
        .usage(() =>
            "使用示例：\r" +
            "打包官谱《六兆年と一夜物語》：\r" +
            "kirapack 128\r" +
            "\r" +
            "打包Bestdori社区ID为19078的谱面：\r" +
            "kirapack 19078\r" +
            "\r" +
            "打包Bestdori社区ID为41131的谱面，同时添加背景视频：\r" +
            "kirapack 41131 -v https://example.com/example.mp4")
        .action(async (argv, id, args) => {
            try {
                if (id === null || id === undefined)
                    return withQuoteBySession(argv, "使用示例：kirapack 128")
                if (typeof id !== "number" || id <= 0)
                    return withQuoteBySession(argv, "您提供的ID无效，请确认后再试。")
                const timer = setTimeout(() => {
                    argv.session?.send(withQuoteBySession(
                        argv,
                        `正在为您查询 ID 为 ${id} 的谱面，请稍候……`
                    )).catch(console.error)
                }, 3000)
                const chart = await mixLookupCharts(id)
                clearTimeout(timer)
                if (!chart)
                    return withQuoteBySession(argv, `ID 为 ${id} 的谱面不存在，请检查后再试。`)
                if (chart.official) {
                    return "是官谱啊喵？咕咕咕咕咕咕"
                    if (!fs.existsSync(__data_dir + `/kirapack/official_${id}.kirapack`)) {
                        argv.session?.send(withQuoteBySession(
                            argv,
                            `正在为您打包生成 ${getByLocale(chart.official.title, BandoriServer.cn)}，请稍候……`
                        )).catch(console.error)
                    }
                    argv.session?.send(withQuoteBySession(
                        argv,
                        `↓↓↓复制下方链接到浏览器以下载 [${id}]${getByLocale(chart.official.title, BandoriServer.cn)}`
                    )).catch(console.error)
                }
                if (chart.community) {
                    if (!fs.existsSync(__data_dir + `/kirapack/community_${id}.kirapack`)) {
                        argv.session?.send(withQuoteBySession(
                            argv,
                            `正在为您打包生成 ${chart.community.title}，请稍候……`
                        )).catch(console.error)

                        {
                            const details = await BestdoriAPI.post.details(id)
                            const chartNotes = details.post.chart
                            const convertedChart = bd2bg(chartNotes)
                            const BPMs: NoteBPM[] = chartNotes.filter(n => n.type === "BPM") as NoteBPM[]
                            BPMs.sort((a, b) => a.bpm - b.bpm)
                            const chart: Record<string, BanGroundChart> = {}
                            chart[BanGroundDifficulty[details.post.diff]] = {
                                version: 2,
                                difficulty: BanGroundDifficultyC[details.post.diff],
                                level: details.post.level,
                                offset: 0,
                                ...convertedChart
                            }
                            const optPath = await kirapack({
                                id,
                                title: details.post.title,
                                artist: details.post.artists,
                                author: details.post.author.username,
                                authorNick: details.post.author.nickname || details.post.author.username,
                                preview: [0, 0],
                                BPM: [BPMs[0].bpm, BPMs[BPMs.length - 1].bpm],
                                length: 0,
                                audio: await getAudioUrl(details.post.song),
                                cover: await getCoverUrl(details.post.song),
                                chart,
                                tag: []
                            })
                            fs.renameSync(optPath, path.join(__data_dir, `./kirapack/community_${id}.kirapack`))
                        }
                    }
                    await argv.session?.send(withQuoteBySession(
                        argv,
                        `↓↓↓复制下方链接到浏览器以下载 [${id}]${chart.community.title}`
                    )).catch(console.error)
                    await argv.session?.send(withQuoteBySession(
                        argv,
                        `${kiraconf.kirapack.baseURL}${kiraconf.kirapack.baseURL.endsWith("/") ? "" : "/"}community_${id}.kirapack`
                    )).catch(console.error)
                }
                return ""
            } catch (e) {
                return "发生错误：" + e.toString()
            }
        })
}
