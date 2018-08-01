// NODE MODULE IMPORTS
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");

//SET ENVIRONMENTAL VARIABLES
require("dotenv").config();

// ACCESS SPOTIFY KEYS
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

// ====================
// ACTIONS FOR LIRI
// ====================
var commands = process.argv;

// command for LIRI will always be second argument
var action = commands[2];

// arguments will be third argument onwards
var argument = "";
for (var i = 3; i < commands.length; i++) {
    argument += commands[i] + ' ';
}

// Arugments will be taken in and assessed use switch case 
function liri(action, argument) {
    switch (action) {
        //=====================
        // SPOTIFY
        //=====================
        case "spotify-this-song":
            // gets song title argument 
            var songTitle = argument;
            // if no song title provided 
            if (songTitle === "") {
                // The Sign, Ace of Base is not the first song that the spotify retrives, 
                // so put it into it's own function
                defaultSong();
            } else {
                getSongInfo(songTitle);
            }
            break;
            //=====================
            // OMDB
            //=====================
        case "movie-this":
            var movieTitle = argument;
            // if no movie title provided 
            if (movieTitle === "") {
                getMovieInfo("Mr.Nobody");
            } else {
                getMovieInfo(movieTitle);
            }
            break;
            //=====================
            // RANDOM.TXT
            //=====================
        case "do-what-it-says":
            doWhatItSays();
            break;
    }
}

//==============================
// OMDB
//==============================
function getMovieInfo(movieTitle) {
    var queryURL = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy";

    request(queryURL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var movie = JSON.parse(body);
            console.log(movie); 

            // Parse the body of the site and recover just the imdbRating
            console.log("\n------------------------");
            console.log("Compiling Movie Information:");
            console.log("\nMovie Title: " + movie.Title);
            console.log("Release Year: " + movie.Year);
            console.log("IMDB Rating: " + movie.imdbRating);
            console.log("Rotten Tomatoes Rating: " + movie.Ratings[1].Value)
            console.log("Country Produced In: " + movie.Country);
            console.log("Language: " + movie.Language);
            console.log("Plot: " + movie.Plot);
            console.log("Actors: " + movie.Actors);
            console.log("------------------------");



            // PREPPING FOR FILE LOG
            var movieData = [
                "\nMovie Title: " + movie.Title,
                "Release Year: " + movie.Year,
                "IMDB Rating: " + movie.imdbRating,
                "Rotten Tomatoes Rating: " + movie.Ratings[1].Value,
                "Country Produced In: " + movie.Country,
                "Language: " + movie.Language,
                "Plot: " + movie.Plot,
                "Actors: " + movie.Actors

            ].join("\n\n");

            fs.appendFile("log.txt", movieData, function (err) {
                if (err) throw (err);
            })
        }
    })
}

//=====================
// CALLING SPOTIFY API
//=====================
function getSongInfo(songTitle) {
    spotify.search({
        type: 'track',
        query: songTitle
    }, function (err, data) {
        if (err) {
            console.log("Error occured:" + err);
            return;
        }

        var data = data.tracks.items[0];

        // print artists, track name, preview url, and album name
        console.log("\n------------------------")
        console.log("Compiling Track Information:");
        console.log("\nArtist: " + data.artists[0].name);
        console.log("Song: " + data.name);
        console.log("Spotify Preview URL: " + data.external_urls.spotify);
        console.log("Album name: " + data.album.name);
        console.log("------------------------");

        // PREPPING FOR FILE LOG
        var songData = [
            "Artist: " + data.artists[0].name,
            "Song: " + data.name,
            "Spotify Preview URL: " + data.external_urls.spotify,
            "Album name: " + data.album.name
        ].join("\n\n");

        // APPENDING TO FILE
        fs.appendFile("log.txt", songData, function (err) {
            if (err) throw (err);
        })

    })
};

//===================================
// CALLING SPOTIFY API: DEFAULT SONG
//===================================
function defaultSong() {
    spotify.search({
        type: 'track',
        query: 'The Sign',
        limit: 10
    }, function (err, data) {
        if (err) {
            console.log("Error occured:" + err);
            return;
        }
        var data = data.tracks.items[5];

        // print artists, track name, preview url, and album name
        console.log("\n------------------------")
        console.log("Compiling Track Information:");
        console.log("\nArtist: " + data.artists[0].name);
        console.log("Song: " + data.name);
        console.log("Spotify Preview URL: " + data.external_urls.spotify);
        console.log("Album name: " + data.album.name);

        // PREPPING FOR FILE LOG
        var songData = [
            "Artist: " + data.artists[0].name,
            "Song: " + data.name,
            "Spotify Preview URL: " + data.external_urls.spotify,
            "Album name: " + data.album.name
        ].join("\n\n");

        fs.appendFile("log.txt", songData, function (err) {
            if (err) throw (err);
        })
    })
}

//==============================
// DO-WHAT-IT-SAYS FUNCTION 
//==============================
function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            console.log(err);
        } else {

            console.log(data);
            // create array with information 
            var randomArray = data.split(",");

            // // set action argument to first item in randomArray 
            action = randomArray[0];
            console.log("\nAction: " + action);
            argument = randomArray[1];
            console.log("\nArgument: " + argument)

            // calls do something function 
            liri(action, argument);
        }
    });
}

// ====================
// CALL LIRI
// ====================
liri(action, argument);

