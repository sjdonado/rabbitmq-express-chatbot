const bcrypt = require('bcrypt');

const db = require('../services/database');

const saltRounds = 10;

const create = (username, plainTextPassword) => new Promise((res, rej) => {
  const password = bcrypt.hashSync(plainTextPassword, bcrypt.genSaltSync(saltRounds));
  db.insert({ username, password }, (err, newDoc) => {
    if (err) {
      rej(err);
    }
    res(newDoc);
  });
});

const login = (username, plainTextPassword) => new Promise((res, rej) => {
  db.findOne({ username }, (err, doc) => {
    if (err || !doc || !bcrypt.compareSync(plainTextPassword, doc.password)) {
      rej(new Error('User not found'));
    }
    res(doc);
  });
});

module.exports = {
  create,
  login,
};
