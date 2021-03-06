const promise = require('bluebird');
const faker = require('faker');
const options = { promiseLib: promise };
const pgp = require('pg-promise')(options);
const data = require('./data-generation.js');

const cn = 'postgresql://jonathan:123@localhost:5432/tracks';
const db = pgp(cn);
const cs = new pgp.helpers.ColumnSet(['id', 'artist', 'track', 'album', 'albumart', 'plays', 'likes', 'shares', 'comments'], {table: 'tracks'});

const faker = require('faker');

// 10M tracks
// 50K artists
// 50k albums
// 10000 album imgs
// const tracks = [];
// const albumArts = [];
// const artists = [];
// const albums = [];

// for (var i = 0; i < 10000000; i++) {
//   if (i < 1000) {
//     albumArts[i] = faker.random.image();
//   }
//   if (i < 50000) {
//     artists[i] = faker.name.findName();
//     albums[i] = `${faker.commerce.product()} ${faker.commerce.product()}`
//   }
//   tracks[i] = `${faker.lorem.word()} ${faker.lorem.word()}`;
// }

console.time('seed');


// Generating 10,000 records 1000 times, for the total of 10 million records:
function getNextData(t, pageIndex) {
    let values;
    if (pageIndex < 1000) {
        values = [];
        for (let i = 1; i <= 10000; i++) {
            const idx = pageIndex * 10000 + i; // to insert unique product names
            values.push({
                id: idx,
                artist: data.artists[idx % 50000],
                track: data.tracks[i-1],
                album: data.albums[idx % 50000],
                albumart: data.albumArts[idx % 1000],
                plays: Math.floor(Math.random() * 800000),
                likes: Math.floor(Math.random() * 23000),
                shares: Math.floor(Math.random() * 2000),
                comments: Math.floor(Math.random() * 500)
            });
        }
    }
    return Promise.resolve(values);
}


db.tx('massive-insert', t => {
    return t.sequence(index => {
        return getNextData(t, index)
            .then(result => {
                if (result) {
                    const insert = pgp.helpers.insert(result, cs);
                    return t.none(insert);
                }
            });
    });
})
.then(() => {
  console.timeEnd('seed');
  console.log('done');
});







