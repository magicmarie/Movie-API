// Main passport library and strategy for login requests
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Models = require('./models.js');

// Passport library for JWT authentication of registered users
const passportJWT = require('passport-jwt');

var Users = Models.User;
var JWTStrategy = passportJWT.Strategy;
var ExtractJWT = passportJWT.ExtractJwt;

// LocalStrategy defines basic HTTP authentication for login requests. Takes username and password from request body.
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password'
    },
    function(username, password, callback) {
      console.log(username + ' ' + password);
      // db call, returned user object is assumed to be pre-formattet and ready for storing in JWT.
      Users.findOne({ Username: username }, function(error, user) {
        if (error) {
          console.log(error);
          return callback(error);
        }
        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password'
          });
        }
        // If there is a match, cb will be executed: this will be the login endpoint.
        console.log('finished');
        return callback(null, user);
      });
    }
  )
);

/*Protected requests:*/
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret'
    },
    function(jwtPayload, callback) {
      return Users.findById(jwtPayload._id)
        .then(function(user) {
          return callback(null, user);
        })
        .catch(function(error) {
          return callback(error);
        });
    }
  )
);