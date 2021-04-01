/* eslint-disable no-unused-vars */
`use strict`;

require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();

app.use(cors());
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

//variabeles
let locationLatitude;
let locationLongitude;
let weatherArray = [];
let parksArr = [];
let mArr = [];
let yArr = [];


// Route Middlewares

app.get('/location', (request, response) => {
    //get search query
    let city = request.query.city;
    // use API to get data and send the data to constructer or catch error
    let url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
    superagent.get(url).then(res => {
        let data = res.body[0];
        let locationObject = new Location(city, data);
        response.send(locationObject);
    }).catch((error) => {
        response.send(`Not Found ${error}`);
    })
});

app.get('/weather', (request, response) => {
    // use WEATHER_API_KEY to get data and send the data to constructer or catch error
    let url = `http://api.weatherbit.io/v2.0/forecast/daily?lat=${locationLatitude}&lon=${locationLongitude}&key=${WEATHER_API_KEY}`
    superagent.get(url).then(res => {
        let dataWeather = res.body;
        dataWeather.data.map(element => {
            new Weather(element);
        })
        response.send(weatherArray);
        weatherArray = [];
    }).catch((error) => {
        response.status(500).send(`Not Found ${error}`);
    })
});


app.get('/parks', (request, response) => {
    // use PARKS_API_KEY to get data and send the data to constructer or catch error
    const url = `https://developer.nps.gov/api/v1/parks?api_key=${PARKS_API_KEY}&q=${request.query.search_query}`;
    superagent.get(url).then(res => {
        res.body.data.map(data => {
            new Park(data)
        });
        response.send(parksArr);
        parksArr = [];
    }).catch((error) => {
        response.send(`Not Found ${error}`);
    })
});

app.get('/movies', (request, response) => {
    // use MOVIE_API_KEY to get data and send the data to constructer or catch error
    let url = `http://api.themoviedb.org/3/movie/top_rated?api_key=${MOVIE_API_KEY}&query=${request.query.city}`
    mArr = [];
    superagent.get(url).then(res => {
        let movieData = res.body.results;
        movieData.forEach(object => {
            new Movie(object);
        });
        response.send(mArr)
    })

});


app.get('/yelp', yelphandler);
app.use('*', (request, response) => {
    response.status(404).send('Not Found!');
});


function yelphandler(request, response) {
    // use MOVIE_API_KEY to get data and send the data to constructer or catch error
    //I tried to create this function as an arrow function but it did not work I don't know why
    const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.latitude}&longitude=${request.query.longitude}&limit=20`;
    superagent.get(url)
        .set('Authorization', `Bearer ${YELP_API_KEY}`)
        .then(res => {
            yArr = [];
            let yelpData = res.body.businesses;
            yelpData.map(object => {
                yArr.push(new Yelp(object));
            });
            return response.json(yArr);
        })
}




//constructor functions
function Location(search_query, object) {
    this.search_query = search_query;
    this.formatted_query = object.display_name;
    this.latitude = object.lat;
    this.longitude = object.lon;
    locationLatitude = object.lat;
    locationLongitude = object.lon;
}
function Weather(object) {
    this.forecast = object.weather.description;
    this.time = object.valid_date;
    weatherArray.push(this);
}

function Park(object) {
    this.name = object.fullName;
    this.address = `${object.addresses[0].line1} ${object.addresses[0].city}`;
    this.fee = object.entranceFees[0].cost;
    this.description = object.description;
    this.url = object.url;
    parksArr.push(this);
}

function Movie(object) {
    this.title = object.title;
    this.overview = object.overview;
    this.average_votes = object.vote_average;
    this.total_votes = object.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500/${object.poster_path}`;
    this.popularity = object.popularity;
    this.released_on = object.release_date;
    mArr.push(this);
}

function Yelp(object) {
    this.name = object.name;
    this.image_url = object.image_url;
    this.price = object.price;
    this.rating = object.rating;
    this.url = object.url;
}
// Listen for request
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})

