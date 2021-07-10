import {
    BandoriChartDiff,
    BestdoriApiPostDetails, BestdoriApiPostDetailsSongBandori,
    BestdoriApiPostDetailsSongCustom, BestdoriApiPostDetailsSongLlsif, BestdoriApiPostDetailsSongOsu,
    BestdoriApiSongsSong,
    BestdoriNote
} from "./Bestdori";
import BestdoriAPI from "./Bestdori";
import {firstNotNullIndex} from "../util";

export interface OfficialChartDifficulty {
    difficultyClass: BandoriChartDiff
    level: number
    publishedAt?: Array<number | null>
}

export interface OfficialChartInfo {
    title: Array<string | null>
    band: Array<string | null>
    composer: Array<string | null>
    lyricist: Array<string | null>
    arranger: Array<string | null>
    difficulties: Array<OfficialChartDifficulty>
    publishedAt: Array<number | null>
}

export interface CommunityChartInfo {
    title: string
    artists: string
    author: {
        username: string
        nickname: string | null
    }
    time: number
    difficultyClass: BandoriChartDiff
    level: number
}

export interface MixLookupChartsResult {
    official?: OfficialChartInfo
    community?: CommunityChartInfo
}

export async function mixLookupCharts(id: number): Promise<MixLookupChartsResult | null> {
    const promiseOfficial = new Promise<BestdoriApiSongsSong | null>((resolve, reject) => {
        BestdoriAPI.songs.song(id).then(resolve).catch(e => {
            if (e.isAxiosError && e.response && e.response.status === 404) resolve(null)
            else reject(e)
        })
    })
    const promiseCommunity = new Promise<BestdoriApiPostDetails | null>((resolve, reject) => {
        BestdoriAPI.post.details(id).then(v => {
            if (v.post.categoryName === "SELF_POST") resolve(v)
            else resolve(null)
        }).catch(e => {
            if (e.toString().includes("REQUEST_INVALID")) resolve(null)
            else reject(e)
        })
    })
    const apiResults = await Promise.all([promiseOfficial, promiseCommunity])
    if (!apiResults[0] && !apiResults[1]) return null
    const result: MixLookupChartsResult = {
        official: undefined,
        community: undefined
    }
    if (apiResults[0]) {
        const bands = await BestdoriAPI.bands.all()
        const unknownBand = ["未知のアーティスト", "Unknown Artist", "未知藝術家", "未知艺术家", "미 지 의 예술가"]
        const difficulties: Array<OfficialChartDifficulty> = []
        for (const diff in apiResults[0].difficulty) {
            difficulties.push({
                difficultyClass: parseInt(diff),
                level: apiResults[0].difficulty[diff].playLevel,
                publishedAt: apiResults[0].difficulty[diff].publishedAt?.map(v => v ? parseInt(v) : null)
            })
        }
        result.official = {
            title: apiResults[0].musicTitle,
            band: bands[apiResults[0].bandId].bandName || unknownBand,
            composer: apiResults[0].composer,
            lyricist: apiResults[0].lyricist,
            arranger: apiResults[0].arranger,
            difficulties,
            publishedAt: apiResults[0].publishedAt.map(v => v ? parseInt(v) : null)
        }
    }
    if (apiResults[1]) {
        result.community = {
            title: apiResults[1].post.title,
            artists: apiResults[1].post.artists,
            author: apiResults[1].post.author,
            time: apiResults[1].post.time,
            difficultyClass: apiResults[1].post.diff,
            level: apiResults[1].post.level
        }
    }
    return result
}

export enum BandoriServer {
    jp,
    en,
    tw,
    cn,
    kr
}

export const BandoriServerList = {
    0: "jp",
    1: "en",
    2: "tw",
    3: "cn",
    4: "kr"
}

export const getByLocale = (array: Array<string | null>, locale: BandoriServer): string | null => array[locale] || array.filter(i => i)[0]

export async function getAudioUrl(payload: BestdoriApiPostDetailsSongCustom | BestdoriApiPostDetailsSongBandori | BestdoriApiPostDetailsSongLlsif | BestdoriApiPostDetailsSongOsu): Promise<string | null> {
    if (payload.type === "custom") return payload.audio
    else if (payload.type === "bandori") {
        const song = await BestdoriAPI.songs.song(payload.id)
        const serverName = BandoriServerList[firstNotNullIndex(song.publishedAt)]
        // https://bestdori.com/assets/cn/sound/bgm128_rip/bgm128.mp3
        return `https://bestdori.com/assets/${serverName}/sound/bgm${payload.id}_rip/bgm${payload.id}.mp3`
    } else if (payload.type === "llsif") {
        const llsifList = await BestdoriAPI.misc.llsif()
        if (!llsifList[payload.id]) throw new Error("ERR_LLSIF_SONG_NOT_EXISTS")
        return `https://card.niconi.co.ni/asset/${llsifList[payload.id].sound}`
    }
    return null
}

export async function getCoverUrl(payload: BestdoriApiPostDetailsSongCustom | BestdoriApiPostDetailsSongBandori | BestdoriApiPostDetailsSongLlsif | BestdoriApiPostDetailsSongOsu): Promise<string | null> {
    if (payload.type === "custom") return payload.cover
    else if (payload.type === "bandori") {
        const song = await BestdoriAPI.songs.song(payload.id)
        const serverName = BandoriServerList[firstNotNullIndex(song.publishedAt)]
        // https://bestdori.com/assets/en/musicjacket/musicjacket1010_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket1010-1001_saikou_eng-jacket.png
        const ceil = Math.ceil(payload.id / 10) * 10
        return `https://bestdori.com/assets/${serverName}/musicjacket/musicjacket${ceil}_rip/assets-star-forassetbundle-startapp-musicjacket-musicjacket${ceil}-${song.jacketImage[0]}-jacket.png`
    } else if (payload.type === "llsif") {
        const llsifList = await BestdoriAPI.misc.llsif()
        if (!llsifList[payload.id]) throw new Error("ERR_LLSIF_SONG_NOT_EXISTS")
        return `https://card.niconi.co.ni/asset/${llsifList[payload.id].icon}`
    }
    return null
}
