import Axios, {AxiosInstance} from "axios"

export interface BestdoriApiUser {
    nickname: string | null
    posterCard: {
        id: number
        offset: number
        trainedArt: boolean
    }
    titles: BestdoriApiUserTitle[] | null
    selfIntro: string | null
    serverIds: BestdoriApiUserServerId[] | null
    socialMedia: string | null
    favCharacters: number[] | null
    favBands: number[] | null
    favCards: number[] | null
    favSongs: number[] | null
    favCostumes: number[] | null
    followed: false
    followingCount: number
    followedByCount: number
}

export interface BestdoriApiUserServerId {
    id: number
    server: number
}

export interface BestdoriApiUserTitle {
    id: number
    type: string
    server: number
}

export interface BestdoriApiUserBasic {
    username: string
    nickname: string | null
    titles: BestdoriApiUserTitle[] | null
}

export interface BestdoriApiPostDetailsSongCustom {
    type: "custom"
    audio: string
    cover: string
}

export interface BestdoriApiPostDetailsSongBandori {
    type: "bandori"
    id: number
}

export interface BestdoriApiPostDetailsSongLlsif {
    type: "llsif"
    id: number
}

export interface BestdoriApiPostDetailsSongOsu {
    type: "osu"
    id: number
}

export enum BandoriChartDiff {
    easy,
    normal,
    hard,
    expert,
    special
}

export type BandoriChartLevel =
    5 | 6 | 7 | 8 | 9 | 10 |
    11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
    21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30

export interface BestdoriPostContentObject {
    type: string
    data?: unknown
}

export interface BestdoriPostTag {
    type: string
    data?: unknown
}

export interface BestdoriApiPostBasic {
    title: string
    author: {
        username: string
    }
}

export interface BestdoriApiPostDetails {
    post: {
        categoryName: "SELF_POST"
        categoryId: "chart"
        title: string
        song:
            BestdoriApiPostDetailsSongCustom |
            BestdoriApiPostDetailsSongBandori |
            BestdoriApiPostDetailsSongLlsif |
            BestdoriApiPostDetailsSongOsu
        artists: string
        diff: BandoriChartDiff
        level: BandoriChartLevel
        chart: Array<BestdoriNote>
        content: BestdoriPostContentObject[]
        time: number
        author: BestdoriApiUserBasic
        likes: number
        like: boolean
        tags: BestdoriPostTag[]
    }
}

export interface BestdoriApiSongsSongAchievement {
    musicId: number
    achievementType: string
    rewardType: string
    quantity: number
}

export interface BestdoriApiSongsSongDifficulty {
    playLevel: number,
    multiLiveScoreMap: Record<string, BestdoriApiSongsSongDifficultyMultiLiveScoreMap>
    notesQuantity: number
    scoreC: number
    scoreB: number
    scoreA: number
    scoreS: number
    scoreSS: number
    publishedAt?: Array<string | null>
}

export interface BestdoriApiSongsSongDifficultyMultiLiveScoreMap {
    musicId: number
    musicDifficulty: string
    multiLiveDifficultyId: number
    scoreC: number
    scoreB: number
    scoreA: number
    scoreS: number
    scoreSS: number
    multiLiveDifficultyType: string
}

export interface BestdoriApiSongsSongBpm {
    bpm: number
    start: number
    end: number
}

export interface BestdoriApiSongsSong {
    bgmId: string
    bgmFile: string
    tag: string
    bandId: number
    achievements: BestdoriApiSongsSongAchievement[]
    jacketImage: string[]
    seq: number
    musicTitle: Array<string | null>
    lyricist: Array<string | null>
    composer: Array<string | null>
    arranger: Array<string | null>
    howToGet: Array<string | null>
    publishedAt: Array<string | null>
    closedAt: Array<string | null>
    difficulty: Record<string, BestdoriApiSongsSongDifficulty>
    length: number
    notes: Record<string, number>
    bpm: Record<string, BestdoriApiSongsSongBpm[]>
}

export interface BestdoriApiBandsBand {
    bandName: Array<string | null>
}

export interface Note {
    type: "BPM" | "Single" | "Flick" | "Long" | "Slide" | "Directional"
}

export interface NoteBPM extends Note{
    type: "BPM"
    beat: number
    bpm: number
}

export interface NoteUnknown extends Note {
    [key: string]: unknown
}

export interface NoteSingle extends Note {
    type: "Single"
    beat: number
    lane: number // 0-6
    flick?: true
    skill?: true
}

export interface NoteConnection {
    beat: number
    lane: number
    flick?: true
    hidden?: true
}

export interface NoteSlide extends Note {
    connections: NoteConnection[]
}

export interface NoteLong extends Note {
    connections: [NoteConnection, NoteConnection]
}

export interface NoteDirectional extends Note {
    beat: number
    lane: number
    type: "Directional"
    direction: "Left" | "Right"
    width: number
}

export type BestdoriNote = NoteBPM | NoteUnknown | NoteSingle | NoteSlide | NoteLong | NoteDirectional

export interface LoveliveSongInfo {
    name: string
    name_kana: string
    member_tag: string
    member_filter_cond: 1
    sound: string
    live_time: number
    keyword: string
    icon: string
    attribute: number
    difficulties: {
        id: number
        ac_flag: number
        asset: string
        available: boolean
        difficulty: number
        s_rank_combo: number
        stage_level: number
        swing_flag: number
    }[]
}

class User {
    private readonly axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance
        return this
    }

    public this(username: string): Promise<BestdoriApiUser> {
        return new Promise<BestdoriApiUser>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/user",
                params: {
                    username
                }
            }).then(value => {
                if (value.data.result === true) resolve(value.data as BestdoriApiUser)
                return reject(value.data.code)
            }).catch(reject)
        })
    }
}

class Post {
    private readonly axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance
        return this
    }

    public basic(id: number): Promise<BestdoriApiPostBasic> {
        return new Promise<BestdoriApiPostBasic>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/post/basic",
                params: {
                    id
                }
            }).then(value => {
                if (value.data.result === true) resolve(value.data as BestdoriApiPostBasic)
                return reject(value.data.code)
            }).catch(reject)
        })
    }

    public details(id: number): Promise<BestdoriApiPostDetails> {
        return new Promise<BestdoriApiPostDetails>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/post/details",
                params: {
                    id
                }
            }).then(value => {
                if (value.data.result === true) resolve(value.data as BestdoriApiPostDetails)
                return reject(value.data.code)
            }).catch(reject)
        })
    }
}

class Songs {
    private readonly axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance
        return this
    }

    public song(id: number): Promise<BestdoriApiSongsSong> {
        return new Promise<BestdoriApiSongsSong>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/songs/" + id + ".json"
            }).then(value => {
                resolve(value.data as BestdoriApiSongsSong)
            }).catch(reject)
        })
    }
}

class Bands {
    private readonly axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance
        return this
    }

    /*
        由于静态资源没有必要频繁请求，所以有一个cacheTimeout的可选参数。

        cacheTimeout的含义是，若请求时，已缓存的内容的缓存时间距本次请求
        不足{cacheTimeout}毫秒，则使用缓存的结果；否则就重新进行请求，成
        功时更新缓存。

        举例：设get()为此类请求。
        首先，执行 get(10000) ，此时没有缓存，则请求后缓存本次请求结果。
        5秒后，执行 get(10000) 。此时缓存尚未过期，直接返回上次缓存的结果。
        3秒后，执行 get(7000) 。由于是8秒（8000毫秒）前缓存的数据，
        7000 < 8000，缓存已过期，所以需要重新请求再缓存。
        执行 get(0)，无论有没有缓存，都会请求。
    */

    private cache: Record<string, any> = {
        main: null,
        all: null
    }

    public main(cacheTimeout: number = 3600000): Promise<Record<string, BestdoriApiBandsBand>> {
        // 只包含七大团
        if (this.cache.main && new Date().getTime() - this.cache.main.time <= cacheTimeout)
            return this.cache.main.data
        return new Promise<Record<string, BestdoriApiBandsBand>>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/bands/main.1.json"
            }).then(value => {
                this.cache.main = {
                    time: new Date().getTime(),
                    data: value.data as Record<string, BestdoriApiBandsBand>
                }
                resolve(this.cache.main.data)
            }).catch(reject)
        })
    }

    public all(cacheTimeout: number = 3600000): Promise<Record<string, BestdoriApiBandsBand>> {
        // 包含全部歌手，通常使用这个
        if (this.cache.all && new Date().getTime() - this.cache.all.time <= cacheTimeout)
            return this.cache.all.data
        return new Promise<Record<string, BestdoriApiBandsBand>>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/bands/all.1.json"
            }).then(value => {
                this.cache.all = {
                    time: new Date().getTime(),
                    data: value.data as Record<string, BestdoriApiBandsBand>
                }
                resolve(this.cache.all.data)
            }).catch(reject)
        })
    }
}

class Misc {
    private readonly axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance
        return this
    }

    private cache: Record<string, any> = {
        llsif: null
    }

    public llsif(cacheTimeout: number = 3600000): Promise<Record<string, LoveliveSongInfo>> {
        // https://bestdori.com/api/misc/llsif.10.json
        if (this.cache.llsif && new Date().getTime() - this.cache.llsif.time <= cacheTimeout)
            return this.cache.llsif.data
        return new Promise<Record<string, LoveliveSongInfo>>((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/misc/llsif.10.json"
            }).then(value => {
                this.cache.llsif = {
                    time: new Date().getTime(),
                    data: value.data as Record<string, LoveliveSongInfo>
                }
                resolve(this.cache.llsif.data)
            }).catch(reject)
        })
    }
}

export class Bestdori {
    private readonly axiosInstance: AxiosInstance

    public readonly post: Post
    public readonly user: User
    public readonly songs: Songs
    public readonly bands: Bands
    public readonly misc: Misc
    public readonly util

    constructor(baseURL: string, timeout: number = 30000) {
        const axiosInstance = Axios.create({
            baseURL,
            timeout
        })
        this.axiosInstance = axiosInstance

        this.post = new Post(axiosInstance)
        this.user = new User(axiosInstance)
        this.songs = new Songs(axiosInstance)
        this.bands = new Bands(axiosInstance)
        this.misc = new Misc(axiosInstance)
        this.util = {
            useLocale: <T>(array: Array<T>, locale: string): T => {
                switch (locale) {
                    case "zh-cn":
                        return array[3] || array.filter(i => i)[0]
                    case "en-us":
                        return array[1] || array.filter(i => i)[0]
                    case "ko-kr":
                        return array[4] || array.filter(i => i)[0]
                }
                return array.filter(i => i)[0]
            },
            userToString: (user: BestdoriApiUserBasic): string =>
                user.nickname ? `${user.nickname}@${user.username}` : user.username,
            difficultyToString: (diff: number, difficulty: BestdoriApiSongsSongDifficulty): string =>
                (["Easy", "Normal", "Hard", "Expert", "Special"][diff] || "Unknown") + " " + difficulty.playLevel
        }

        return this
    }
}

const BestdoriAPI = new Bestdori("https://bestdori.com")
export default BestdoriAPI
