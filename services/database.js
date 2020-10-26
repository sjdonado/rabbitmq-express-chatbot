const Datastore = require('nedb');

let filename = `${__dirname}/../db/`;
filename += process.env.NODE_ENV === 'test' ? 'users.test.db' : 'users.db';
const db = new Datastore({ filename });

db.loadDatabase((err) => {
  if (err) {
    console.log(err);
  }
  console.log('[nedb]::connected');
});

module.exports = db;
