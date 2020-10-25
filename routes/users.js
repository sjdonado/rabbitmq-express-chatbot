const router = require('express').Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.json({
    status: 'sent',
  });
});

module.exports = router;
