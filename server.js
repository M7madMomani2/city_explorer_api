'use strict';

// Load environment variables
require('dotenv').config();

// Including application dependencies
const express = require('express');
const superAgent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// Setup the application
const app = express();

// Setup environment vairables
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

const DATABASE_URL = process.env.DATABASE_URL
// Setup Application Middlewares
app.use(cors());


// Database Connection Setup
const client = new pg.Client(DATABASE_URL);
client.on('error', err => { throw err; });


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
  superAgent.get(url).then(res => {
    let data = res.body[0];
    let locationObject = new Location(city, data);

    // let SQL = 'INSERT INTO location (search_query ,formatted_query, latitude , longitude) VALUES (locationObject.search_query, locationObject.formatted_query, locationObject.latitude, locationObject.longitude) RETURNING *;';
    // let safeValues = [locationObject.search_query, locationObject.formatted_query, locationObject.latitude, locationObject.longitude];

    // let SQL2 = `SELECT * FROM location WHERE search_query=${city}`;
    // client.query(SQL)
    //   .then(results => {
    //     response.status(200).json(results);
    //   })
    //   .catch(error => {
    //     response.status(500).send('So sorry, something went wrong.' + error);
    //   });



    // const sql = 'SELECT * FROM locations WHERE city = $1';
    // const sqlArray = [city];

    // client.query(sql, sqlArray)
    //   .then((data) => {
    //     if (data.rowCount === 0) {
    //       const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&city=${city}&format=json`;
    //       superAgent.get(url).then(data => {
    //         // TODO use constructor to format this data
    //         const locationData = data.body[0];
    //         const newLocation = new Location(city, locationData.display_name);
    //         // Save it to a table in our database
    //         const sql = 'INSERT INTO locations (city, display_name) VALUES ($1, $2) RETURNING *;';
    //         const cleanValues = [newLocation.city, newLocation.display_name];
    //         //respond to client
    //         client.query(sql, cleanValues)
    //           .then((data) => {
    //             console.log(data);
    //             res.json(data.rows[0]);
    //           });
    //       })
    //     } else {
    //       res.json(data.rows[0]);
    //     }
    //   });
    

    response.send(locationObject);
  }).catch((error) => {
    response.send(`Not Found ${error}`);
  })
});

app.get('/weather', (request, response) => {
  // use WEATHER_API_KEY to get data and send the data to constructer or catch error
  let url = `http://api.weatherbit.io/v2.0/forecast/daily?lat=${locationLatitude}&lon=${locationLongitude}&key=${WEATHER_API_KEY}`
  superAgent.get(url).then(res => {
    let dataWeather = res.body;
    dataWeather.data.map(element => {
      new Weather(element);
      // console.log(weatherArray);
    })
    response.send(weatherArray);
    weatherArray = [];
  })
    .catch((error) => {
      response.status(500).send(`Not Found ${error}`);
    })
});

app.get('/parks', (request, response) => {
  // use PARKS_API_KEY to get data and send the data to constructer or catch error
  const url = `https://developer.nps.gov/api/v1/parks?api_key=${PARKS_API_KEY}&q=${request.query.search_query}`;
  superAgent.get(url).then(res => {
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
  let url = `http://api.themoviedb.org/3/movie/top_rated?api_key=${MOVIE_API_KEY}&query=${request.query.city}`
  superAgent.get(url).then(res => {
    let movieData = res.body.results;
    movieData.forEach(object => {
      Movie(object);
    });
    response.send(mArr)
  })

});


app.get('/yelp', (request, response) => {
  let url = `https://api.yelp.com/v3/businesses/search&latitude=${locationLatitude}&longitude=${locationLongitude}`
  superAgent.get(url)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(res => {
      let yelpData = res.body.businesses;
      console.log(yelpData);
      yelpData.map(object => {
        new Yelp(object);
      });
      return response.json(yArr);
    })
});


app.get('/', (request, response) => {
  response.send('<h1>Welcome To City Explorer API</h1> ');
});

app.use('*', (request, response) => {
  response.status(404).send('Not Found');
});

client.connect()
  .then(() => {
    // This will only start out webserver if we connected successfully
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    })
  }).catch(error => {
    console.log('Unable to connect to database: ', error.message);
  });


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
  this.address = object.addresses[0].line1 + ' ' + object.addresses[0].city + ' ' + object.addresses[0].stateCode + ' ' + object.addresses[0].postalCode;
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
  this.image_url = 'https://image.tmdb.org/t/p/w500/' + object.poster_path;
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
  yArr.push(this);
}
