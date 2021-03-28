'use strict';
let weatherArray=[];
const PORT  = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.get('/location', getLocation);
app.get('/weather',getWeather);

app.listen(process.env.PORT || PORT, ()=>{
  console.log(`app is listening on port ${PORT}`);
});

function Location(search_query, formatted_query, latitude, longitude){
  this.search_query= search_query;
  this. formatted_query= formatted_query;
  this.latitude= latitude;
  this.longitude = longitude;
}

function Weather(forecast,time){
  this.forecast=forecast;
  this.time = time;
  weatherArray.push(this);

}

function getLocation(request, response){
  try{
    let city = request.query.city;
    let locationData = require('./Data/location.json');
    let getLocationObject = locationData[0];
    let locationObject = new Location(city,getLocationObject.display_name,getLocationObject.lat,getLocationObject.lon);

    response.send(locationObject);
  }catch(error){
    response.status(500).send(error)
  }

}

function getWeather(req,res){
  try{
    if(weatherArray){
      weatherArray=[];
    }
    let weatherData = require('./Data/weather.json');
    let weather = weatherData.data;
    weather.forEach(element =>{
      let Data = new Weather(element.valid_date,element.weather.description);
      console.log(Data);
    });
    res.send(weatherArray);
  }
  catch(error){
    res.status(500).send(error)
  }

}


