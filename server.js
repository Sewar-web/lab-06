'use strict';


const express = require('express');

require('dotenv').config();

const server =express();

const cors = require('cors');

const PORT = process.env.PORT || 2000;

server.use(cors());

server.get('/', (req, res) => {
  res.send('your server is working');
});

server.get('/location', (req, res) => {
  let getData = require('./data/ location.json');
  let locationData = new Location(getData);
  res.send(locationData);
});

function Location (getData)
{
  this.searchQuery = 'Lynwood';
  this.formattedQuery = getData[0].display_name;
  this.latitude = getData[0].lat;
  this.longitude = getData[0].lon;
}

server.get('/weather', (req, res) => {
  let getData = require('./data/ weather.json');
  let newArr=[];
  getData.data.forEach(element => {
    let WeathersData = new Weathers(element);
    newArr.push(WeathersData);

  });
  res.send(newArr);
});


function Weathers (weatherData)
{

  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}

server.get('*',(req,res)=>{
  res.status(404).send('wrong route');
  {
    let errObj = {
      status: 500,
      responseText: 'Sorry, something went wrong'
    };
    res.status(500).send(errObj);
  }});
server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
  console.log('SEWAR');
});

