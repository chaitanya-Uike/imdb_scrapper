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
class IMDBScrapper {
    constructor() {
        this.baseURL = "https://www.imdb.com";
    }
    request(url) {
        return axios_1.default.get(this.baseURL + url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36' } });
    }
    scrapeTitle(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.request(`/title/${id}`);
            const $ = cheerio.load(data);
            const title = $('[data-testid="hero-title-block__title"]').text().trim();
            const originalTitle = $('[data-testid="hero-title-block__original-title"]').text().trim().replace('Original title: ', '');
            const release = $('[data-testid="title-details-releasedate"] .ipc-metadata-list-item__content-container a').text().trim();
            const releaseDate = new Date(release);
            const runtime = $('[data-testid="hero-title-block__metadata"] li').last().text().trim();
            const genre = $('[data-testid="genres"] a').map(function () {
                return $(this).text();
            }).toArray();
            const plot = $('[data-testid="plot"]').first().text().trim();
            const director = $('li[data-testid="title-pc-principal-credit"]:first-child li').map(function () {
                return $(this).text().trim();
            }).toArray().filter(this.filterDistinct);
            console.log(plot);
        });
    }
    filterDistinct(value, index, self) { return self.indexOf(value) === index; }
}
const s = new IMDBScrapper();
s.scrapeTitle("tt1745960");
