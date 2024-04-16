const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ status: "failed", message: 'Authorization token not provided!' });
  }

  jwt.verify(token, process.env.APP_SECRET_KEY, (error, decodedToken) => {
    if (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).send({ status: "failed", message: 'Invalid or expired token!' });
      }
      return res.status(500).send({ status: "failed", message: 'Failed to verify token', error: error.message });
    }
    // Attach the user information to the request object for later use
    req.user = {
      id: decodedToken.userId,
      // role: decodedToken.role,
    };

    next(); // Continue to the next middleware or route handler
  });
};

module.exports = authenticateToken;
