const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const expiresIn = user.isDemo ? '24h' : '7d';
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, isDemo: user.isDemo },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

module.exports = generateToken;
