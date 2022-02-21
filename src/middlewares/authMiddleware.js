const jwt = require('jsonwebtoken');
const config = require('../../config/config');

function verifyToken(req, res, next) {
  if (!req.headers || !req.headers.authorization || !req.headers.authorization.split(' ')[1]) {
    return res.status(401).send({ error: 'No token provided.' });
  }

  const token = req.headers.authorization.split(' ')[1];
  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: 'Invalid or expired token.' });
    }

    req.userId = decoded.id;
    req.role = decoded.role;
    return next();
  });
}

module.exports = verifyToken;
