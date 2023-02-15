import * as cheerio from 'cheerio';
import axios from 'axios';

class IMDBScrapper {
    baseURL = "https://www.imdb.com"

    request(url: string) {
        return axios.get(this.baseURL + url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36' } })
    }

    async scrapeTitle(id: string) {
        const { data } = await this.request(`/title/${id}`)
        const $ = cheerio.load(data)
        const title = $('[data-testid="hero-title-block__title"]').text().trim()
        const originalTitle = $('[data-testid="hero-title-block__original-title"]').text().trim().replace('Original title: ', '')
        const release = $('[data-testid="title-details-releasedate"] .ipc-metadata-list-item__content-container a').text().trim();
        const releaseDate = new Date(release)
        const runtime = $('[data-testid="hero-title-block__metadata"] li').last().text().trim()
        const genre = $('[data-testid="genres"] a').map(function () {
            return $(this).text()
        }).toArray()
        const plot = $('[data-testid="plot"]').first().text().trim()
        const director = $('li[data-testid="title-pc-principal-credit"]:first-child li').map(function () {
            return $(this).text().trim()
        }).toArray().filter(this.filterDistinct)
        const stars = $('li[data-testid="title-pc-principal-credit"]:last-child li').map(function () {
            return $(this).text().trim()
        }).toArray().filter(this.filterDistinct);
        const poster = $('[data-testid="hero-media__poster"] img').first().attr('srcset')?.split(' ').pop()?.trim().split(' ')[0]
        const metascore = $('.score-meta').text().trim() || null;
        const imdbRating = $('[data-testid="hero-rating-bar__aggregate-rating__score"] > span').first().text().trim()
        const imdbVotes = $('div[class^="AggregateRatingButton__TotalRatingAmount"]').first().text().replace(' ', ',').trim();
        const imdbID = $('[property="imdb:pageConst"]').attr('content');
        const type = $('[property="og:type"]').attr('content')?.replace('video.', '')
        const tagline = $('[data-testid="storyline-taglines"] div').text().trim();
        const language = $('[data-testid="title-details-languages"] li').map(function () { return $(this).text().trim() }).toArray();
    }

    filterDistinct(value: string, index: number, self: string[]) { return self.indexOf(value) === index }
}

const s = new IMDBScrapper()

s.scrapeTitle("tt1745960")
