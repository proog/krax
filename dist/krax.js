"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
class Krax {
    /**
     * Create a new instance.
     * @param verbose If true, some diagnostic messages will be printed using
     * console.error when searching.
     */
    constructor(verbose = false) {
        this.verbose = verbose;
        this.agents = [
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36"
        ];
    }
    /**
     * Alias for searchByRelevance.
     */
    search(query, limit = 0) {
        return this.searchByRelevance(query, limit);
    }
    /**
     * Uses the default search ("by relevance").
     * @param query Text string to search for.
     * @param limit Limit result count to this value, or 0 to get all results.
     */
    searchByRelevance(query, limit = 0) {
        let url = `https://www.krak.dk/person/resultat/${encodeURIComponent(query)}`;
        return this.doSearch(url, limit);
    }
    /**
     * Uses the distance-based search based on the given coordinates.
     * @param query Text string to search for.
     * @param lat The latitude.
     * @param lon The longitude.
     * @param limit Limit result count to this value, or 0 to get all results.
     */
    searchByDistance(query, lat, lon, limit = 0) {
        let url = "https://www.krak.dk/query?what=ps&proximity_area=proximity_all"
            + `&search_word=${encodeURIComponent(query)}`
            + `&xcoord=${lon}`
            + `&ycoord=${lat}`;
        return this.doSearch(url, limit);
    }
    doSearch(url, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            limit = Math.max(0, limit);
            let results = yield this.processPage(url, 1, [], limit);
            results.sort((a, b) => a.rank - b.rank);
            return results.slice(0, limit > 0 ? limit : results.length);
        });
    }
    processPage(url, page, results, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                userAgent: this.agents[Math.floor(Math.random() * this.agents.length)]
            };
            if (this.verbose)
                console.error(`Processing ${url}`);
            let dom = yield jsdom_1.JSDOM.fromURL(url, options), doc = dom.window.document, totalPages = 1, nextPageUrl = null, totalPagesElement = doc.querySelector(".paging .page-count span"), nextPageElement = doc.querySelector(".paging .page-next a[href]"), hitList = doc.querySelectorAll("#hit-list li");
            if (totalPagesElement && totalPagesElement.textContent)
                totalPages = parseInt(totalPagesElement.textContent.replace("...", "").trim());
            if (nextPageElement)
                nextPageUrl = nextPageElement.getAttribute("href");
            if (page++ === 1 && this.verbose)
                console.error(`${totalPages} pages (estimated)`);
            for (let hit of hitList) {
                let person = this.parsePerson(hit), hasUniqueRank = person.rank && results.every(x => x.rank !== person.rank);
                if (person.name && hasUniqueRank)
                    results.push(person);
            }
            if (nextPageUrl && (limit === 0 || results.length < limit))
                return this.processPage(nextPageUrl, page, results, limit);
            return results;
        });
    }
    parsePerson(hit) {
        let emailElements = hit.querySelectorAll(".self-info-list li"), coordinateElement = hit.querySelector(".hit-address-location"), email = null, latitude = null, longitude = null;
        let getText = (selector) => {
            let element = hit.querySelector(selector);
            return (element && element.textContent)
                ? element.textContent.trim()
                : "";
        };
        for (let element of emailElements) {
            let potentialEmail = element.textContent
                ? element.textContent.trim()
                : "";
            if (/.+@.+/.test(potentialEmail)) {
                email = potentialEmail;
                break;
            }
        }
        if (coordinateElement) {
            try {
                let json = coordinateElement.getAttribute("data-coordinate") || "", parsed = JSON.parse(json);
                if ("coordinate" in parsed) {
                    latitude = parsed["coordinate"]["lat"];
                    longitude = parsed["coordinate"]["lon"];
                }
            }
            catch (e) {
                if (this.verbose) {
                    console.error("Could not parse coordinates: ", e);
                }
            }
        }
        return {
            rank: parseInt(getText(".hit-pin-number")),
            name: getText(".hit-name-ellipsis a"),
            phone: getText(".hit-phone-number").replace(/\s/g, "") || null,
            address: getText(".hit-street-address") || null,
            zip: getText(".hit-postal-code") || null,
            city: getText(".hit-address-locality") || null,
            place: getText(".hit-postal-place-name") || null,
            title: getText(".hit-name-ellipsis .person-title-result") || null,
            email: email,
            lat: latitude,
            lon: longitude
        };
    }
}
exports.Krax = Krax;
//# sourceMappingURL=krax.js.map