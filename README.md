# krax
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
