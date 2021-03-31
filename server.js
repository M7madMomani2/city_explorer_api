'use strict';

// Load environment variables
require('dotenv').config();

// Including application dependencies
const express = require('express');
const superAgent = require('superagent');
const cors = require('cors');

// Setup the application
const app = express();

// Setup environment vairables
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;

// Setup Application Middlewares
app.use(cors());

//variabeles
let locationLatitude;
let locationLongitude;
let weatherArray=[];
let parksArr=[];



// Route Middlewares

app.get('/location', (request, response)=>{
  //get search query
  let city = request.query.city;
  // use API to get data and send the data to constructer or catch error
  let url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
  superAgent.get(url).then(res=>{
    let data=res.body[0];
    let locationObject = new Location(city,data);
    response.send(locationObject);
  }).catch((error)=>{
    response.send(`Not Found ${error}`);
  })
});

app.get('/weather',(request,response)=>{
  // use WEATHER_API_KEY to get data and send the data to constructer or catch error
  let url=`http://api.weatherbit.io/v2.0/forecast/daily?lat=${locationLatitude}&lon=${locationLongitude}&key=${WEATHER_API_KEY}`
  superAgent.get(url).then(res=>{
    let dataWeather=res.body;
    dataWeather.data.map(element =>{
      new Weather(element);
      // console.log(weatherArray);
    })
    response.send(weatherArray);
    weatherArray=[];
  })
    .catch((error)=>{
      response.status(500).send(`Not Found ${error}`);
    })
});

app.get('/parks', (request,response)=>{
  // use PARKS_API_KEY to get data and send the data to constructer or catch error
  const url = `https://developer.nps.gov/api/v1/parks?api_key=${PARKS_API_KEY}&q=${request.query.search_query}`;
  superAgent.get(url).then(res => {
    res.body.data.map(data => {
      console.log(data);
      new Park(data)
    });
    response.send(parksArr);
    console.log(parksArr);
  }).catch((error) => {
    response.send(`Not Found ${error}`);
  })
});


app.get('/',(request, response)=>{
  response.send('<h1>Welcome To City Explorer API</h1> ');
});

app.use('*',(request, response)=>{
  response.status(404).send('Not Found');
});


// Listen for request
app.listen(PORT , ()=>{
  console.log(`listening on port ${PORT}`);
});

//constructor functions
function Location(search_query,object){
  this.search_query= search_query;
  this. formatted_query= object.display_name;
  this.latitude= object.lat;
  this.longitude = object.lon;
  locationLatitude=object.lat;
  locationLongitude=object.lon;
}
function Weather(object){
  this.forecast=object.weather.description;
  this.time = object.valid_date;
  weatherArray.push(this);
}

function Park(object) {
  this.name = object.fullName;
  this.address = object.addresses[0].line1 + ' ' + object.addresses[0].city + ' ' + object.addresses[0].stateCode + ' ' + object.addresses[0].postalCode;
  this.fee =object.entranceFees[0].cost;
  this.description = object.description;
  this.url =object.url;
  parksArr.push(this);
}
