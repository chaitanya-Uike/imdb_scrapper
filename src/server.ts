import * as cheerio from 'cheerio';
import axios from 'axios';
import qs from "querystring"

class IMDBScraper {
    baseURL = "https://www.imdb.com"

    request(url: string) {
        return axios.get(this.baseURL + url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
            }
        })
    }

    async search(title: string) {
        const options = {
            title,
            view: 'advanced',
            count: 10
        }

        let { data } = await this.request(`/search/title?${qs.stringify(options)}`)
        const $ = cheerio.load(data)
        const results: any[] = []
        $('.lister-item').each((i, el) => {
            results.push(this.getResult($(el)))
        })

        return { results, noOfResults: results.length }
    }

    getResult(elem: cheerio.Cheerio<cheerio.Element>) {
        const title = elem.find('.lister-item-header a').text().trim()
        const year = elem.find('.lister-item-year').text().replace(/\(|\)/g, '').trim() || null
        const poster = elem.find('.lister-item-image img').attr('loadlate') || null
        const genre = elem.find('.genre').text().trim().split(', ') || null
        const imdbRating = elem.find('[name="ir"]').attr('data-value') || null
        const imdbVotes = elem.find('[name="nv"]').attr('data-value') || null
        const imdbID = elem.find('.lister-item-header a').attr('href')?.split('/')[2]
        return {
            title,
            year,
            poster,
            genre,
            imdbRating,
            imdbVotes,
            imdbID
        }
    }


    async scrapeTitle(id: string) {
        let { data } = await this.request(`/title/${id}`)
        const $ = cheerio.load(data)

        const title = $('[data-testid="hero-title-block__title"]').text().trim()

        const originalTitle = $('[data-testid="hero-title-block__original-title"]').text().trim().replace('Original title: ', '') || title

        const datePublished = $('[data-testid="title-details-releasedate"] .ipc-metadata-list-item__content-container a').text().trim();

        const runtime = $('[data-testid="hero-title-block__metadata"] li').last().text().trim()

        const genre = $('[data-testid="genres"] a').map(function () {
            return $(this).text()
        }).toArray()

        const description = $('[data-testid="plot"]').first().text().trim()

        const director = this.getDirector($)

        const stars = this.getStars($)

        const poster = $('[data-testid=hero-media__poster] img').attr('src')

        const metascore = $('.score-meta').text().trim() || null;

        const imdbRating = $('[data-testid="hero-rating-bar__aggregate-rating__score"] > span').first().text().trim()

        const imdbID = $('[property="imdb:pageConst"]').attr('content');

        const type = $('[property="og:type"]').attr('content')?.replace('video.', '')

        const language = $('[data-testid="title-details-languages"] li').map(function () { return $(this).text().trim() }).toArray();

        const budget = $('[data-testid="title-boxoffice-budget"] label').text().trim()

        const grossWorldwide = $('[data-testid="title-boxoffice-cumulativeworldwidegross"] label').text().trim()

        const cast = this.getCast($)

        const seasons = this.getSeasons($)

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
        }
    }

    getCast($: cheerio.CheerioAPI) {
        const cast = $('[data-testid="title-cast-item"]').map(function () {
            return {
                img: $(this).find('img').attr('src'),
                name: $(this).find('[data-testid="title-cast-item__actor"]').text().trim(),
                character: $(this).find('[data-testid="cast-item-characters-link"] span').text().trim()
            }
        }).toArray()

        return cast
    }

    getDirector($: cheerio.CheerioAPI) {
        const directors = $('li[data-testid="title-pc-principal-credit"]:first-child li').map(function () {
            return $(this).text().trim()
        }).toArray().filter(this.filterDistinct)
        return directors
    }

    getStars($: cheerio.CheerioAPI) {
        const stars = $('li[data-testid="title-pc-principal-credit"]:last-child li').map(function () {
            return $(this).text().trim()
        }).toArray().filter(this.filterDistinct);
        return stars
    }

    getSeasons($: cheerio.CheerioAPI) {
        const seasons = $('#browse-episodes-season option').filter(function () {
            return parseInt($(this).attr('value') || "0") >= 1
        })
            .map(function () { return Number($(this).attr('value')) })
            .toArray()
            .filter(x => x)
            .sort();

        return seasons
    }

    async episodes(id: string, season: number) {
        const { data } = await this.request(`/title/${id}/episodes?season=${season || 1}`)
        const $ = cheerio.load(data)

        return this.getEpisodes($)
    }

    getEpisodes($: cheerio.CheerioAPI) {
        const episodes = $('.eplist > .list_item').map(function () {
            return {
                image: $(this).find('.image img').first().attr('src'),
                episode: Number($(this).find('[itemprop="episodeNumber"]').attr('content')),
                airDate: $(this).find('.airdate').first().text().trim(),
                name: $(this).find('[itemprop="name"]').first().text().trim(),
                description: $(this).find('[itemprop="description"]').first().text().trim(),
                rating: Number($(this).find('.ipl-rating-star__rating').first().text().trim()),
                votes: Number($(this).find('.ipl-rating-star__total-votes').first().text().trim().replace('(', '').replace(')', '').replace(',', ''))
            }
        }).toArray()

        return episodes
    }

    filterDistinct(value: string, index: number, self: string[]) { return self.indexOf(value) === index }
}

export default IMDBScraper;
