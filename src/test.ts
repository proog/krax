import * as assert from "assert";
import { Krax } from "./index";

async function relevance(krax: Krax) {
    let relevanceResults = await krax.searchByRelevance("jens hansen", 5);
    assert.equal(relevanceResults.length, 5, "Relevance results did not have the expected length");
}

async function distance(krax: Krax) {
    let distanceResults = await krax.searchByDistance("jens hansen", 12.34, -12.34, 10);
    assert.equal(distanceResults.length, 10, "Distance results did not have the expected length");
}

async function zeroResults(krax: Krax) {
    let noResults = await krax.search("doesntexist 32r9n289niniosbuisdf");
    assert.equal(noResults.length, 0, "Relevance results did not return an empty array");
}

(async () => {
    let krax = new Krax();
    await relevance(krax);
    await distance(krax);
    await zeroResults(krax);
    console.log("Tests finished");
})();