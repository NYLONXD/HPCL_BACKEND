const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, password, name,email } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });

    const passwordHash = await bcrypt.hash(password, 10);
    const u = await User.create({ username, passwordHash, name , email });
    return res.json({ message: 'ok', user: u.safe() });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'username exists' });
    return res.status(500).json({ message: 'error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'replace_this_in_prod', { expiresIn: '8h' });
    return res.json({ token, user: user.safe() });
  } catch (err) {
    return res.status(500).json({ message: 'error', error: err.message });
  }
});


module.exports = router;
