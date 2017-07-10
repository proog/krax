import * as assert from "assert";
import { Krax } from "./index";

async function test() {
    const krax = new Krax();

    console.log("Running relevance test");
    let relevanceResults = await krax.searchByRelevance("jens hansen", 5);
    assert.equal(relevanceResults.length, 5, "Relevance results did not have the expected length");

    console.log("Running distance test");
    let distanceResults = await krax.searchByDistance("jens hansen", 12.34, -12.34, 10);
    assert.equal(distanceResults.length, 10, "Distance results did not have the expected length");

    console.log("Tests finished");
}

test();
