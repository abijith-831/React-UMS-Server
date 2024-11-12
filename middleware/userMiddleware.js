
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token.' });
    }

    req.user = {
      userId: decoded.userId, 
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };
    next();
  });
};

module.exports = userMiddleware;
