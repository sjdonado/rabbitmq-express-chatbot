const router = require('express').Router();

const { rabbitmq } = require('../config');
const authentication = require('../middlewares/authentication');

const { clientUri, queueName } = rabbitmq;

/* GET home page. */
router.get('/', authentication, (req, res) => {
  res.render('index', { queueName, clientUri });
});

/* GET login page. */
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

module.exports = router;
