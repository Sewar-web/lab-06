/* eslint-disable camelcase */
/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
'use strict';


const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server =express();



const superagent = require('superagent');

const PORT = process.env.PORT || 2000;


server.use(cors());




server.get('/', handledRouter);
server.get('/location', handledLocation);
server.get('/weather', handledWeather);

server.get('/Parks',handledParks);
server.get('*',handledError);

///////////////////////function/////////////////////


function handledRouter (req, res) {
  res.send('your server is working');
}







function handledLocation (req, res) {

  // console.log(req.query);
  let cityName = req.query.city;
  // console.log(cityName);
  let key = process.env.LOCATION_KEY;
  let LocURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  superagent.get(LocURL)
    .then(getData => {
      // console.log('inside superagent');
      // console.log(getData.body);
      let gData=getData.body;
      const locationData = new Location(cityName , gData);
      res.send(locationData);
    })

    .catch(error => {
      // console.log('inside superagent');
      // console.log('Error in getting data from LocationIQ server');
      console.error(error);
      res.send(error);
    });

}



function handledWeather(req, res) {


  let lat = req.query.latitude;
  let lon = req.query.longitude;
  let key = process.env.WEATHER_KEY;
  let weathersURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=10&key=${key}`;

  superagent.get( weathersURL )
    .then( getData =>{
      let newArr=getData.body.data.map(element => {
        return new Weathers ( element );
      });
      res.send(newArr);
    }

    );}




function handledParks(req , res)
{
  let key = process.env.PARK_KEY;
  let cityName=req.query.search_query;
  let parkURL =`https://developer.nps.gov/api/v1/parks?q=${cityName}&limit=10&api_key=${key}`;
  superagent.get(parkURL)
    .then( getData =>{
      // console.log(getData);
      let newArr=getData.body.data.map(element => {
        return new Park ( element );
      });
      res.send(newArr);
    }
    );
}

function handledError(req,res){
  {
    let errObj = {
      status: 500,
      responseText: 'Sorry, something went wrong'
    };
    res.status(500).send(errObj);
  }}


/////////////////////constructors/////////////////


function Location (cityName , getData)
{
  this.search_query = cityName;
  this.formatted_query = getData[0].display_name;
  this.latitude = getData[0].lat;
  this.longitude = getData[0].lon;
}
function Weathers (weatherData)
{

  this.forecast = weatherData.weather.description;
  this.time =weatherData.valid_date;
}

function Park (getData) {
  this.name = getData.fullName;
  this.address = getData.addresses[0].line1;
  this.fee = getData.fees;
  this.description = getData.description;
  this.url = getData.url;
}


////////////////////listen////////////////////////////

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
  console.log('SEWAR');
});

