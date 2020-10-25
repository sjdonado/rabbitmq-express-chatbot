const router = require('express').Router();

const authentication = require('../middlewares/authentication');

const { rabbitmq } = require('../config');

/* GET home page. */
router.get('/', authentication, (req, res) => {
  res.render('index', {
    username: req.session.username,
    defaultQueue: rabbitmq.defaultQueue,
  });
});

/* GET login page. */
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

module.exports = router;
