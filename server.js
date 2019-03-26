var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/cmcscraper", { useNewUrlParser: true });

app.get("/scrape", function(req, res) {
  axios.get("https://www.coinmarketcap.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("tr").each(function(i, element) {
      var result = {};

      result.name = $(this)
        .children("td a")
        .attr("data-sort");

      result.link = $(this)
        .children("a")
        .attr("href");

      db.Coin.create(result)
        .then(function(dbCoin) {
          console.log(dbCoin);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

app.get("/Coins", function(req, res) {
  db.Coin.find({})
    .then(function(dbCoin) {
      res.json(dbCoin);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/coins/:id", function(req, res) {
  db.Coin.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbCoin) {
      res.json(dbCoin);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/coins/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Coin.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbCoin) {
      res.json(dbCoin);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
