const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Signup new user
 */
exports.signup = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password) 
      return res.status(400).json({ message: 'username & password required' });
    
    const user = await User.create({ username, passwordHash: password, name, email });
    return res.json({ message: 'ok', user: user.safe() });
  } catch (err) {
    if (err.code === 11000) 
      return res.status(400).json({ message: 'username exists' });
    return res.status(500).json({ message: 'error', error: err.message });
  }
};

/**
 * Login existing user
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'replace_this_in_prod',
      { expiresIn: '8h' }
    );

    return res.json({ token, user: user.safe() });
  } catch (err) {
    return res.status(500).json({ message: 'error', error: err.message });
  }
};
