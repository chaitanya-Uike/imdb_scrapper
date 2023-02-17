"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
class IMDBScraper {
    constructor() {
        this.baseURL = "https://www.imdb.com";
    }
    request(url) {
        return axios_1.default.get(this.baseURL + url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
            }
        });
    }
    search(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                title,
                view: 'advanced',
                count: 10
            };
            let { data } = yield this.request(`/search/title?${querystring_1.default.stringify(options)}`);
            const $ = cheerio.load(data);
            const results = [];
            $('.lister-item').each((i, el) => {
                results.push(this.getResult($(el)));
            });
            return { results, noOfResults: results.length };
        });
    }
    getResult(elem) {
        var _a;
        const title = elem.find('.lister-item-header a').text().trim();
        const year = elem.find('.lister-item-year').text().replace(/\(|\)/g, '').trim() || null;
        const poster = elem.find('.lister-item-image img').attr('loadlate') || null;
        const genre = elem.find('.genre').text().trim().split(', ') || null;
        const imdbRating = elem.find('[name="ir"]').attr('data-value') || null;
        const imdbVotes = elem.find('[name="nv"]').attr('data-value') || null;
        const imdbID = (_a = elem.find('.lister-item-header a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[2];
        return {
            title,
            year,
            poster,
            genre,
            imdbRating,
            imdbVotes,
            imdbID
        };
    }
    scrapeTitle(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let { data } = yield this.request(`/title/${id}`);
            const $ = cheerio.load(data);
            const title = $('[data-testid="hero-title-block__title"]').text().trim();
            const originalTitle = $('[data-testid="hero-title-block__original-title"]').text().trim().replace('Original title: ', '') || title;
            const datePublished = $('[data-testid="title-details-releasedate"] .ipc-metadata-list-item__content-container a').text().trim();
            const runtime = $('[data-testid="hero-title-block__metadata"] li').last().text().trim();
            const genre = $('[data-testid="genres"] a').map(function () {
                return $(this).text();
            }).toArray();
            const description = $('[data-testid="plot"]').first().text().trim();
            const director = this.getDirector($);
            const stars = this.getStars($);
            const poster = $('[data-testid=hero-media__poster] img').attr('src');
            const metascore = $('.score-meta').text().trim() || null;
            const imdbRating = $('[data-testid="hero-rating-bar__aggregate-rating__score"] > span').first().text().trim();
            const imdbID = $('[property="imdb:pageConst"]').attr('content');
            const type = (_a = $('[property="og:type"]').attr('content')) === null || _a === void 0 ? void 0 : _a.replace('video.', '');
            const language = $('[data-testid="title-details-languages"] li').map(function () { return $(this).text().trim(); }).toArray();
            const budget = $('[data-testid="title-boxoffice-budget"] label').text().trim();
            const grossWorldwide = $('[data-testid="title-boxoffice-cumulativeworldwidegross"] label').text().trim();
            const cast = this.getCast($);
            const seasons = this.getSeasons($);
            return {
                title,
                originalTitle,
                datePublished,
                runtime,
                genre,
                description,
                director,
                stars,
                poster,
                metascore,
                imdbRating,
                imdbID,
                type,
                language,
                budget,
                grossWorldwide,
                cast,
                seasons
            };
        });
    }
    getCast($) {
        const cast = $('[data-testid="title-cast-item"]').map(function () {
            return {
                img: $(this).find('img').attr('src'),
                name: $(this).find('[data-testid="title-cast-item__actor"]').text().trim(),
                character: $(this).find('[data-testid="cast-item-characters-link"] span').text().trim()
            };
        }).toArray();
        return cast;
    }
    getDirector($) {
        const directors = $('li[data-testid="title-pc-principal-credit"]:first-child li').map(function () {
            return $(this).text().trim();
        }).toArray().filter(this.filterDistinct);
        return directors;
    }
    getStars($) {
        const stars = $('li[data-testid="title-pc-principal-credit"]:last-child li').map(function () {
            return $(this).text().trim();
        }).toArray().filter(this.filterDistinct);
        return stars;
    }
    getSeasons($) {
        const seasons = $('#browse-episodes-season option').filter(function () {
            return parseInt($(this).attr('value') || "0") >= 1;
        })
            .map(function () { return Number($(this).attr('value')); })
            .toArray()
            .filter(x => x)
            .sort();
        return seasons;
    }
    episodes(id, season) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.request(`/title/${id}/episodes?season=${season || 1}`);
            const $ = cheerio.load(data);
            return this.getEpisodes($);
        });
    }
    getEpisodes($) {
        const episodes = $('.eplist > .list_item').map(function () {
            return {
                image: $(this).find('.image img').first().attr('src'),
                episode: Number($(this).find('[itemprop="episodeNumber"]').attr('content')),
                airDate: $(this).find('.airdate').first().text().trim(),
                name: $(this).find('[itemprop="name"]').first().text().trim(),
                description: $(this).find('[itemprop="description"]').first().text().trim(),
                rating: Number($(this).find('.ipl-rating-star__rating').first().text().trim()),
                votes: Number($(this).find('.ipl-rating-star__total-votes').first().text().trim().replace('(', '').replace(')', '').replace(',', ''))
            };
        }).toArray();
        return episodes;
    }
    filterDistinct(value, index, self) { return self.indexOf(value) === index; }
}
exports.default = IMDBScraper;
