const router = require('express').Router();

const { rabbitmq } = require('../config');

const { clientUri, queueName } = rabbitmq;

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { queueName, clientUri });
});

module.exports = router;
