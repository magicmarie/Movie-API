const express = require("express");
const app = express();
const bodyParser = require("body-parser");

morgan = require("morgan");
app.use(morgan("common"));

let myMovies = [
  {
    title: "Criminal Minds",
    Duration: "2 hours 45 min"
  },
  {
    title: "Amazing Grace",
    Duration: "2 hours"
  },
  {
    title: "God is not dead",
    Duration: "1 hour"
  }
];

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(methodOverride());
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/movies", function(req, res) {
  res.json(myMovies);
});

app.get("/", function(req, res) {
  res.send("Welcome to my app!");
});

app.use(express.static("public"));

// listen for requests
app.listen(8080, () => console.log("Your app is listening on port 8080."));
