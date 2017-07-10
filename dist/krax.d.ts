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
export declare class Krax {
    private verbose;
    private agents;
    /**
     * Create a new instance.
     * @param verbose If true, some diagnostic messages will be printed using
     * console.error when searching.
     */
    constructor(verbose?: boolean);
    /**
     * Alias for searchByRelevance.
     */
    search(query: string, limit?: number): Promise<KraxPerson[]>;
    /**
     * Uses the default search ("by relevance").
     * @param query Text string to search for.
     * @param limit Limit result count to this value, or 0 to get all results.
     */
    searchByRelevance(query: string, limit?: number): Promise<KraxPerson[]>;
    /**
     * Uses the distance-based search based on the given coordinates.
     * @param query Text string to search for.
     * @param lat The latitude.
     * @param lon The longitude.
     * @param limit Limit result count to this value, or 0 to get all results.
     */
    searchByDistance(query: string, lat: number, lon: number, limit?: number): Promise<KraxPerson[]>;
    private doSearch(url, limit);
    private processPage(url, page, results, limit);
    private parsePerson(hit);
}
