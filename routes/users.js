const router = require('express').Router();

const User = require('../models/user');

router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new Error('username and password are nested fields');
    }
    const user = await User.create(username, password);
    res.json({
      user,
    });
  } catch ({ message }) {
    res.status(500).json({
      error: {
        message,
      },
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new Error('username and password are nested fields');
    }
    await User.login(username, password);
    req.session.username = username;
    res.redirect('/');
  } catch ({ message }) {
    res.render('login', { error: message });
  }
});

router.get('/logout', async (req, res) => {
  req.session.username = null;
  res.redirect('/');
});

module.exports = router;
