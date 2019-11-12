const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();

morgan = require("morgan");
app.use(morgan("common"));

// Serve static file(s) in public folder
app.use(express.static('public'));

let myMovies = [
  {
    id: 1,
    Title: "Criminal Minds",
    Duration: "2 hours 45 min",
    Genre: "Crime and Drama",
    Description:
      "An elite team of FBI profilers analyze the country's most twisted criminal minds, anticipating their next moves before they strike again. The Behavioral Analysis Unit's most experienced agent is David Rossi, a founding member of the BAU who returns to help the team solve new cases."
  },
  {
    id: 2,
    Title: "Amazing Grace",
    Duration: "2 hours",
    Genre: "Family",
    Description: "Figure it out "
  },
  {
    id: 3,
    Title: "God is not dead",
    Duration: "1 hour",
    Genre: "Spiritual",
    Description: "God is not dead"
  },
  {
    id: 4,
    Title: "Security",
    Duration: "1 hour",
    Genre: "Action",
    Description: "Dangerous"
  }
];

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
app.get("/movies", function(req, res) {
  res.json(myMovies);
});

// index page
app.get("/", function(req, res) {
  res.send("Welcome to my app!");
});

// get a particular movie
app.get("/movies/:Title", (req, res) => {
  res.json(
    myMovies.find(function(movie) {
      console.log(movie);
      return movie.Title === req.params.Title;
    })
  );
});

// add new movie
app.post("/movies", (req, res) => {
  let newMovie = req.body;

  if (
    !newMovie.title &&
    !newMovie.Genre &&
    !newMovie.Duration &&
    !newMovie.Description
  ) {
    res.status(400).send("Missing title, genre, duration or description");
  } else {
    newMovie.id = uuid.v4();
    myMovies.push(newMovie);
    res.status(201).send(newMovie);
  }
});

// delete a movie
app.delete("/movies/:Title", (req, res) => {
  let movie = myMovies.find(movie => {
    return movie.Title === req.params.Title;
  });
  if (movie) {
    myMovies.filter(function(obj) {
      return obj.Title !== req.params.Title;
    });
    res.status(201).send("Movie " + req.params.Title + " was deleted.");
  }
});

//update a movie
app.put("movies/:id", (req, res) => {
  let movie = myMovies.find(movie => {
    return movie.id === req.params.id;
  });
  if (movie) {
    movie = req.params;
    res.status(201).send("Movie " + req.params.title + " updated ");
  } else {
    res.status(404).send("Movie " + req.params.title + " was not found.");
  }
});

app.use(express.static("public"));

// listen for requests
app.listen(8080, () => console.log("Your app is listening on port 8080."));
