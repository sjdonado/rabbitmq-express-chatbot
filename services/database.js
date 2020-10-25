const Datastore = require('nedb');

const db = new Datastore({ filename: '../db/users.db' });

db.loadDatabase((err) => {
  if (err) {
    console.log(err);
  }
  console.log('[nedb]::connected');
});

module.exports = db;