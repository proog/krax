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
const assert = require("assert");
const index_1 = require("./index");
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        const krax = new index_1.Krax();
        console.log("Running relevance test");
        let relevanceResults = yield krax.searchByRelevance("jens hansen", 5);
        assert.equal(relevanceResults.length, 5, "Relevance results did not have the expected length");
        console.log("Running distance test");
        let distanceResults = yield krax.searchByDistance("jens hansen", 12.34, -12.34, 10);
        assert.equal(distanceResults.length, 10, "Distance results did not have the expected length");
        console.log("Tests finished");
    });
}
test();
//# sourceMappingURL=test.js.map