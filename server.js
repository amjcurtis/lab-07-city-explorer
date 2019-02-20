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

// Old version
// app.get('/location', (req, res) => { // 'req is request, 'res' is response
//   //TODO refactor per 2.png - api route
//   const locationData = searchToLatLong(req.query.data);
//   res.send(locationData);
// });

// New version
app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
});

// Event listener for route 'weather'

//CALLBACK FUNC FOR WEATHER
app.get('/weather', (req, res) => {

  const weatherData = getWeather(req.query.data);
  res.send(weatherData);
});
//TODO you will need to put a meetups route here that uses meetups handler - WE CREATE 
//TODO catch all route for error handling


// Catch-all route that invokes error handler if bad request for location path comes in
// TODO Only checks for bad *path*. More robust handler will handle other types of bad requests
app.use('*', handleError);

// Event listener that makes server listen for requests
// Server starter to listen to port goes below routes
app.listen(PORT, () => console.log(`App is up on ${PORT}`));

////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////

// Error handler

//refactor error handler to handle different types of errors, as opossed to handling ALL errors.
function handleError(err, res) {
  // console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

// Geocode lookup handler
function searchToLatLong(query) {
  // OLD WAY TO RETRIEVE DATA
  const geoData = require('./data/geo.json');

  //replace local data source with live api call to get data dynamically


  // NEW WAY TO RETRIEVE DATA
  // Send API URL with query string we want: URL plus '
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;


  // OLD CODE (IS REPLACED BY BLOCK BELOW 
  // const location = new Location(query, geoData);
  // console.log('location in searchToLatLong()', location);
  // return location;

  // NEW CODE FROM CLASS  
  return superagent.get(url)
    .then(result => {
      return new Location(query, result);
    })
    .catch(error => handleError(error));
}

function Location(query, res) { // 'res' is short for 'result'
  console.log('res in Location()', res);
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address; // TODO: CHANGE [0] TO res.body.results
  this.latitude = res.results[0].geometry.location.lat; // TODO: CHANGE [0] TO res.body.results
  this.longitude = res.results[0].geometry.location.lng; // TODO: CHANGE [0] TO res.body.results
}


//take in dynamic lat and long to return dynamic data for weather
function getWeather() {

  const darkskyData = require('./data/darksky.json');

  const weatherSummaries = darkskyData.daily.data.map( day => {

    return new Weather(day);
  })
    
  console.log('log', weatherSummaries)
return weatherSummaries;

}

// Constructor needed for function getWeather()
function Weather(day) {
  this.forecast = day.summary;
  // Get Date/time on server itself (faster than requesting it from API)
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}
