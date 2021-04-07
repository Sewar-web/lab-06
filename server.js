/* eslint-disable camelcase */
/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
'use strict';


const express = require('express');

require('dotenv').config();

const cors = require('cors');
const pg = require('pg');
const server = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 2000;
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false } });
server.use(cors());

////////////////////////////////////////////////////////////////////

server.get('/', handledRouter);
server.get('/location', handledLocation);
server.get('/weather', handledWeather);
server.get('/Parks', handledParks);
server.get('*', handledError);

////////////////////////function/////////////////////


function handledRouter(req, res) {
  res.send('your server is working');
}


function handledLocation(req, res) {

  let cityNameData = req.query.city;
  let key = process.env.LOCATION_KEY;
  let LocURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityNameData}&format=json`;
  superagent.get(LocURL)
    .then(getData => {
      let gData = getData.body;
      const newLocationData = new Location(cityNameData, gData);
      let SQL = 'SELECT * FROM locations WHERE search_query=$1;';//creadt amjad
      let savaData = [cityNameData];
      client.query( SQL,savaData).then(result => { /*the secenod value always array =>savadata*/
        if (result.rowCount) {
          res.send(result.rows[0]);
        }
        else {
          let city = newLocationData.search_query;
          let discription = newLocationData.formatted_query;
          let lat = newLocationData.latitude;
          let lon = newLocationData.longitude;
          SQL = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *;';
          let locationSafeValues = [city, discription, lat, lon];
          client.query(SQL, locationSafeValues)
            .then(result => {
              res.send(result.rows[0]);
            });
        }
      });

    })


    .catch (error => {
      console.log('Error in getting data from LocationIQ server');
      console.error(error);
      res.send(error);


    });


}








function handledWeather(req, res) {


  let lat = req.query.latitude;
  let lon = req.query.longitude;
  let key = process.env.WEATHER_KEY;
  let weathersURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=10&key=${key}`;

  superagent.get(weathersURL)
    .then(getData => {
      let newArr = getData.body.data.map(element => {
        return new Weathers(element);
      });
      res.send(newArr);
    }

    );
}




function handledParks(req, res) {
  let key = process.env.PARK_KEY;
  let cityName = req.query.search_query;
  let parkURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&limit=10&api_key=${key}`;
  superagent.get(parkURL)
    .then(getData => {
      // console.log(getData);
      let newArr = getData.body.data.map(element => {
        return new Park(element);
      });
      res.send(newArr);
    }
    );
}

function handledError(req, res) {
  {
    let errObj = {
      status: 500,
      responseText: 'Sorry, something went wrong'
    };
    res.status(500).send(errObj);
  }
}


/////////////////////constructors/////////////////


function Location(cityName, getData) {
  this.search_query = cityName;
  this.formatted_query = getData[0].display_name;
  this.latitude = getData[0].lat;
  this.longitude = getData[0].lon;
}
function Weathers(weatherData) {

  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}

function Park(getData) {
  this.name = getData.fullName;
  this.address = getData.addresses[0].line1;
  this.fee = getData.fees;
  this.description = getData.description;
  this.url = getData.url;
}


////////////////////listen////////////////////////////

client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
      console.log('SEWAR');
    });
  });


