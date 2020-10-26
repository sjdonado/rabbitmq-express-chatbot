const https = require('https');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const tmpDir = `${__dirname}/../tmp`;

const fetchStockPice = (stock) => new Promise((res, rej) => {
  const url = `https://stooq.com/q/l/?s=${stock}&f=sd2t2ohlcv&h&e=csv`;
  const filename = `${tmpDir}/${Number(new Date())}.csv`;
  const file = fs.createWriteStream(filename);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        const data = parse(fs.readFileSync(filename));
        res(parse(data[1][6]));
      });
    });
  }).on('error', ({ message }) => { // Handle errors
    fs.unlink(filename);
    rej(message);
  });
});

module.exports = {
  fetchStockPice,
};
