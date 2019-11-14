var jwtSecret = 'your_jwt_secret'; 
var jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

function generateJWTToken(user) {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username encoding in JWT
    expiresIn: '7d', // Token will expire in 7 days
    algorithm: 'HS256' // Algorithm used to encode values of JWT
  });
}

// POST login.
module.exports = function(router) {
  router.post('/login', function(req, res) {
    passport.authenticate('local', { session: false }, function(
      error,
      user,
      info
    ) {
      if (error || !user) {
        console.log(error, "sdjnfijfkd", user, "jwnifdks", info)

        return res.status(400).json({
          message: info,
          user: user
        });
      }
      req.login(user, { session: false }, function(error) {
        if (error) {
          res.send(error);
        }
        var token = generateJWTToken(user.toJSON());
        return res.json({ user, token }); // ES6 shorthand for: res.json({user: user, token: token})
      });
    })(req, res);
  });
};