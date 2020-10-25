const router = require('express').Router();

const { publishToQueue } = require('../services/rabbitmq');

router.post('/send', (req, res) => {
  const { msg } = req.body;
  publishToQueue(msg);
  res.json({
    status: 'sent',
  });
});

module.exports = router;
