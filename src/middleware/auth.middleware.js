const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_in_prod');
    req.user = payload; // contains id, username, role
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
