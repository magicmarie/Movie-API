const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Models = require('./models.js');
const passport = require('passport');

require('./passport');

const cors = require('cors');

// Allowing only certain origins to be given access
var allowedOrigins = ['http://localhost:8080'];

const { check, validationResult } = require('express-validator');

const app = express();

app.use(cors());

const Movies = Models.Movie;
const Users = Models.User;

morgan = require("morgan");
app.use(morgan("common"));

// Allowing Mongoose to connect to myMovies
mongoose.connect('mongodb://localhost:27017/myMovies', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // if specific origin isn't found on list of allowed origins
        var message =
          'The CORS policy for this application doesn´t allow access from origin' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

// Serve static file(s) in public folder
app.use(express.static('public'));

const auth = require('./auth')(app);

// allows you to read the “body” of HTTP requests within your request handlers
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), function(
  req, res) {
  Movies.find()
    .then(function(movies) {
      res.status(201).json(movies);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get single movie, by title
app.get( '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Movies.findOne({ Title: req.params.Title })
      .then(function(movie) {
        res.json(movie);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get data about genre, by name
app.get( '/movies/genres/:Name',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Movies.findOne({ 'Genre.Name': req.params.Name })
      .then(function(movie) {
        res.json(movie.Genre);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get data about a director, by name
app.get( '/movies/directors/:Name',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then(function(movie) {
        res.json(movie.Director);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/*USERS*/

app.post('/users', function(req, res) {
  Users.findOne({ Username: req.body.Username })
    .then(function(user) {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then(function(user) {
            res.status(201).json(user);
          })
          .catch(function(error) {
            console.log(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch(function(error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), function(
  req, res) {
  Users.find()
    .then(function(users) {
      res.status(201).json(users);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get( '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Users.findOne({ Username: req.params.Username })
      .then(function(user) {
        res.json(user);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error: ' + error);
      });
  }
);

// update user details
app.put( '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      // makes sure that the updated document is returned
      { new: true },
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Adds movie to list of favorites by MovieID
app.post( '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { Favorites: req.params.MovieID } },
      { new: true },
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send('Error' + err);
        } else {
          res
            .status(201)
            .send(
              'The movie with ID ' +
                req.params.MovieID +
                ' was successfully added to list of favorites. ' +
                'Favorites of ' +
                updatedUser.Username +
                ': ' +
                updatedUser.Favorites
            );
        }
      }
    );
  }
);

// Removes movie from list of favorites by ID
app.delete( '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { Favorites: req.params.MovieID } },
      { new: true },
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res
            .status(200)
            .send(
              'The movie with ID ' +
                req.params.MovieID +
                ' was successfully deleted from the list of favorites. ' +
                'Favorites of ' +
                updatedUser.Username +
                ': ' +
                updatedUser.Favorites
            );
        }
      }
    );
  }
);

// Delete user by username
app.delete( '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(function(user) {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch(function(err) {
        console.error(err);
        res.status(400).send('Error: ' + err);
      });
  }
);

// listen for requests
app.listen(8080, () => console.log("Your app is listening on port 8080."));
