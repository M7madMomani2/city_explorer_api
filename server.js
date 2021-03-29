'use strict';

const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());
const PORT  = process.env.PORT || 3001;

function Location(search_query, formatted_query, latitude, longitude){
  this.search_query= search_query;
  this. formatted_query= formatted_query;
  this.latitude= latitude;
  this.longitude = longitude;
}

let weatherArray=[];
function Weather(forecast,time){
  this.forecast=forecast;
  this.time = time;
  weatherArray.push(this);
}

app.get('/location', (request, response)=>{
  try{
    let city = request.query.city;
    let locationData = require('./Data/location.json')[0];
    let locationObject = new Location(city,locationData.display_name,locationData.lat,locationData.lon);
    response.send(locationObject);
  } catch(error) {
    response.status(500).send('error')
  }
});
app.get('/weather',(request,response)=>{
  try{
    if(weatherArray.length>0){
      weatherArray.splice(0,weatherArray.length)
    }
    let weatherData = require('./Data/weather.json');
    let weather = weatherData.data;
    weather.forEach(element =>{
      let Data = new Weather(element.valid_date,element.weather.description);
      console.log(Data);
    });
    response.send(weatherArray);
  }
  catch(error){
    response.status(500).send('error')
  }

}
);

app.get('/',(request, response)=>{
  response.send('<h1>Welcome To City Explorer API</h1>');
});

app.get('*',(request, response)=>{
  response.send(request.query.city);
});

app.listen(PORT , ()=>{
  console.log(`listening on port ${PORT}`);
});





