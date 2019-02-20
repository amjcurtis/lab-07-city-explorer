'use strict';

// Load environment variables from .env file
require('dotenv').config();

// Application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

////////////////////////////////////////
// API ROUTES
////////////////////////////////////////

// Event listener for route 'location' (so client can request location data)
app.get('/location', (req, res) => { // 'req is request, 'res' is response
  const locationData = searchToLatLong(req.query.data);
  res.send(locationData);
});

// Event listener for route 'weather'
app.get('/weather', (req, res) => {
  const weatherData = getWeather(req.query.data);
  res.send(weatherData);
});

// Catch-all route that invokes error handler if bad request for location path comes in
// Only checks for bad *path*. More robust handler will handle other types of bad requests
app.use('*', handleError);

// Event listener that makes server listen for requests
// Server starter to listen to port goes below routes
app.listen(PORT, () => console.log(`App is up on ${PORT}`));

////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////

// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

// 
function searchToLatLong(query) {
  // OLD WAY TO RETRIEVE DATA
  const geoData = require('./data/geo.json');
  
  // NEW WAY TO RETRIEVE DATA
  // Send API URL with query string we want: URL plus '?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  // OLD CODE (IS REPLACED BY BLOCK BELOW 
  // const location = new Location(query, geoData);
  // console.log('location in searchToLatLong()', location);
  // return location;

  // NEW CODE FROM CLASS  
  return superagent.get(url)
    .then(result => {
      return new Location(query, result);
    })
    .catch(error => handleError);
}

function Location(query, res) { // 'res' is short for 'result'
  console.log('res in Location()', res);
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address; // TODO: CHANGE [0] TO res.body.results
  this.latitude = res.results[0].geometry.location.lat; // TODO: CHANGE [0] TO res.body.results
  this.longitude = res.results[0].geometry.location.lng; // TODO: CHANGE [0] TO res.body.results
}

function getWeather() {
  const darkskyData = require('./data/darksky.json');

  // Need to create an array, since we'll be returning an array of objects
  const weatherSummaries= [];

  // Need to pass each object in the raw data through the constructor
  // Need to iterate over our raw data
  darkskyData.daily.data.forEach(day => {
    // Need to push the new instances into the array we just created
    weatherSummaries.push(new Weather(day));
  });
  // Return the array that's been filled with instances
  console.log('weather in searchToLatLong()', weatherSummaries);
  return weatherSummaries;
}

// Constructor needed for function getWeather()
function Weather(day) {
  this.forecast = day.summary;
  // Get Date/time on server itself (faster than requesting it from API)
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}
