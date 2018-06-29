# krax (deprecated)

**Deprecation notice**: As of June 2018, this library is no longer compatible with the current Krak people search UI. In a recent update, the site itself is now using a simple JSON API with a data representation similar to the one offered by *krax* and *krax-client* ([example](https://www.krak.dk/api/ps?query=jens%20hansen&limit=25)). This change effectively makes *krax* obsolete, so I currently have no intention to update this library.

Highly unofficial library for programmatic interaction with Krak people search.

It's available [on npm](https://www.npmjs.com/package/krax).

Uses ES2015 features as well as JSDOM, which also uses ES2015 features. Based on screen scraping of the Krak people search, so it's pretty fragile.

Example usage:

```js
let { Krax } = require('krax')
  , krax = new Krax();

krax.searchByRelevance('john smith', 5).then(results => {
  console.log(results);
});

krax.searchByDistance('john smith', 12.34, -12.34, 5).then(results => {
  console.log(results);
});
```

Each result is an object of the following form:

```
{
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
```
