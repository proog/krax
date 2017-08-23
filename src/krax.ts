import { JSDOM } from "jsdom";

export interface KraxPerson {
    rank: number;
    name: string;
    phone: string;
    address: string;
    zip: string;
    city: string;
    place: string;
    title: string;
    email: string;
    lat: number;
    lon: number;
}

export class Krax {
    private agents = [
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36"
    ];

    /**
     * Create a new instance.
     * @param verbose If true, some diagnostic messages will be printed using
     * console.error when searching.
     */
    constructor(private verbose = false) { }

    /**
     * Alias for searchByRelevance.
     */
    search(query: string, limit = 0) {
        return this.searchByRelevance(query, limit);
    }

    /**
     * Uses the default search ("by relevance").
     * @param query Text string to search for.
     * @param limit Limit result count to this value, or 0 to get all results.
     */
    searchByRelevance(query: string, limit = 0) {
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
    searchByDistance(query: string, lat: number, lon: number, limit = 0) {
        let url = "https://www.krak.dk/query?what=ps&proximity_area=proximity_all"
            + `&search_word=${encodeURIComponent(query)}`
            + `&xcoord=${lon}`
            + `&ycoord=${lat}`;
        return this.doSearch(url, limit);
    }

    private async doSearch(url: string, limit: number) {
        limit = Math.max(0, limit)

        let results = await this.processPage(url, 1, [], limit);
        results.sort((a, b) => a.rank - b.rank);
        return results.slice(0, limit > 0 ? limit : results.length);
    }

    private async processPage(url: string, page: number, results: KraxPerson[], limit: number): Promise<KraxPerson[]> {
        let options = {
            userAgent: this.agents[Math.floor(Math.random() * this.agents.length)]
        };

        if (this.verbose)
            console.error(`Processing ${url}`);

        let dom = await JSDOM.fromURL(url, options),
            doc = dom.window.document,
            totalPages = 1,
            nextPageUrl: string | null = null,
            totalPagesElement = doc.querySelector(".paging .page-count span"),
            nextPageElement = doc.querySelector(".paging .page-next a[href]"),
            hitList = doc.querySelectorAll("#hit-list li");

        if (totalPagesElement && totalPagesElement.textContent)
            totalPages = parseInt(totalPagesElement.textContent.replace("...", "").trim());

        if (nextPageElement)
            nextPageUrl = nextPageElement.getAttribute("href");

        if (page++ === 1 && this.verbose)
            console.error(`${totalPages} pages (estimated)`);

        for (let hit of hitList) {
            let person = this.parsePerson(hit),
                hasUniqueRank = person.rank && results.every(x => x.rank !== person.rank);

            if (person.name && hasUniqueRank)
                results.push(person);
        }

        dom.window.close(); // dispose jsdom instance

        if (nextPageUrl && (limit === 0 || results.length < limit))
            return this.processPage(nextPageUrl, page, results, limit);

        return results;
    }

    private parsePerson(hit: Element) {
        let emailElements = hit.querySelectorAll(".self-info-list li"),
            coordinateElement = hit.querySelector(".hit-address-location"),
            email: string | null = null,
            latitude: number | null = null,
            longitude: number | null = null;

        let getText = (selector: string) => {
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
                let json = coordinateElement.getAttribute("data-coordinate") || "",
                    parsed = JSON.parse(json);

                if ("coordinate" in parsed) {
                    latitude = parsed["coordinate"]["lat"];
                    longitude = parsed["coordinate"]["lon"];
                }
            }
            catch (e) {
                if (this.verbose) {
                    console.error("Could not parse coordinates: ", e)
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
        } as KraxPerson;
    }
}
