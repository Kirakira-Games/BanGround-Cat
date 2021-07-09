"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bestdori = exports.BandoriChartDiff = void 0;
const axios_1 = __importDefault(require("axios"));
var BandoriChartDiff;
(function (BandoriChartDiff) {
    BandoriChartDiff[BandoriChartDiff["easy"] = 0] = "easy";
    BandoriChartDiff[BandoriChartDiff["normal"] = 1] = "normal";
    BandoriChartDiff[BandoriChartDiff["hard"] = 2] = "hard";
    BandoriChartDiff[BandoriChartDiff["expert"] = 3] = "expert";
    BandoriChartDiff[BandoriChartDiff["special"] = 4] = "special";
})(BandoriChartDiff = exports.BandoriChartDiff || (exports.BandoriChartDiff = {}));
class User {
    constructor(axiosInstance) {
        this.axiosInstance = axiosInstance;
        return this;
    }
    this(username) {
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/user",
                params: {
                    username
                }
            }).then(value => {
                if (value.data.result === true)
                    resolve(value.data);
                return reject(value.data.code);
            }).catch(reject);
        });
    }
}
class Post {
    constructor(axiosInstance) {
        this.axiosInstance = axiosInstance;
        return this;
    }
    basic(id) {
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/post/basic",
                params: {
                    id
                }
            }).then(value => {
                if (value.data.result === true)
                    resolve(value.data);
                return reject(value.data.code);
            }).catch(reject);
        });
    }
    details(id) {
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/post/details",
                params: {
                    id
                }
            }).then(value => {
                if (value.data.result === true)
                    resolve(value.data);
                return reject(value.data.code);
            }).catch(reject);
        });
    }
}
class Songs {
    constructor(axiosInstance) {
        this.axiosInstance = axiosInstance;
        return this;
    }
    song(id) {
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/songs/" + id + ".json"
            }).then(value => {
                resolve(value.data);
            }).catch(reject);
        });
    }
}
class Bands {
    constructor(axiosInstance) {
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
        this.cache = {
            main: null,
            all: null
        };
        this.axiosInstance = axiosInstance;
        return this;
    }
    main(cacheTimeout = 3600000) {
        // 只包含七大团
        if (this.cache.main && new Date().getTime() - this.cache.main.time <= cacheTimeout)
            return this.cache.main.data;
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/bands/main.1.json"
            }).then(value => {
                this.cache.main = {
                    time: new Date().getTime(),
                    data: value.data
                };
                resolve(this.cache.main.data);
            }).catch(reject);
        });
    }
    all(cacheTimeout = 3600000) {
        // 包含全部歌手，通常使用这个
        if (this.cache.all && new Date().getTime() - this.cache.all.time <= cacheTimeout)
            return this.cache.all.data;
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/bands/all.1.json"
            }).then(value => {
                this.cache.all = {
                    time: new Date().getTime(),
                    data: value.data
                };
                resolve(this.cache.all.data);
            }).catch(reject);
        });
    }
}
class Misc {
    constructor(axiosInstance) {
        this.cache = {
            llsif: null
        };
        this.axiosInstance = axiosInstance;
        return this;
    }
    llsif(cacheTimeout = 3600000) {
        // https://bestdori.com/api/misc/llsif.10.json
        if (this.cache.llsif && new Date().getTime() - this.cache.llsif.time <= cacheTimeout)
            return this.cache.llsif.data;
        return new Promise((resolve, reject) => {
            this.axiosInstance({
                method: "GET",
                url: "api/misc/llsif.10.json"
            }).then(value => {
                this.cache.llsif = {
                    time: new Date().getTime(),
                    data: value.data
                };
                resolve(this.cache.llsif.data);
            }).catch(reject);
        });
    }
}
class Bestdori {
    constructor(baseURL, timeout = 30000) {
        const axiosInstance = axios_1.default.create({
            baseURL,
            timeout
        });
        this.axiosInstance = axiosInstance;
        this.post = new Post(axiosInstance);
        this.user = new User(axiosInstance);
        this.songs = new Songs(axiosInstance);
        this.bands = new Bands(axiosInstance);
        this.misc = new Misc(axiosInstance);
        this.util = {
            useLocale: (array, locale) => {
                switch (locale) {
                    case "zh-cn":
                        return array[3] || array.filter(i => i)[0];
                    case "en-us":
                        return array[1] || array.filter(i => i)[0];
                    case "ko-kr":
                        return array[4] || array.filter(i => i)[0];
                }
                return array.filter(i => i)[0];
            },
            userToString: (user) => user.nickname ? `${user.nickname}@${user.username}` : user.username,
            difficultyToString: (diff, difficulty) => (["Easy", "Normal", "Hard", "Expert", "Special"][diff] || "Unknown") + " " + difficulty.playLevel
        };
        return this;
    }
}
exports.Bestdori = Bestdori;
const BestdoriAPI = new Bestdori("https://bestdori.com");
exports.default = BestdoriAPI;
