'use strict';

// Load environment variables from .env file
require('dotenv').config();

// Application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Application setup
const PORT = process.env.PORT || 3000;

// Load database
// Did I already create a city explorer db per prework steps?
// const client = new pg.Client(process.env.Database_URL); // Database_URL is unique each of us individually
// client.connect();
// clientInformation.onLine('error', err => console.error(err));

// Load expressJS
const app = express();
app.use(cors());

////////////////////////////////////////
// API ROUTES
////////////////////////////////////////

// Event listener for route 'location' (so client can request location data)
// Old version
// app.get('/location', (req, res) => { // 'req is request, 'res' is response
//   const locationData = searchToLatLong(req.query.data);
//   res.send(locationData);
// });
// New version
app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location)) // 'location' is instance of object returned by searchToLatLong()
    .catch(error => handleError(error, response));
});

// Event listener for route 'weather'
// Old version
// app.get('/weather', (req, res) => {
//   const weatherData = getWeather(req.query.data);
//   res.send(weatherData);
// });
// New version
app.get('/weather', getWeather);

// TODO Meetups route here (uses meetups handler to be created in helper functs section)
//TODO catch all routes for error handling

// Catch-all route that invokes error handler if bad request for location path comes in
// TODO Only checks for bad *path*; add more robust handler to handle other types of bad requests
app.use('*', handleError);

// Event listener that starts server listening to port; goes below routes
app.listen(PORT, () => console.log(`App is up on ${PORT}`));

////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////

// Error handler
function handleError(err, res) {
  // console.error(err); // Returns error object
  if (res) res.status(500).send('Sorry, something went wrong');
}

// TODO Refactor for SQL
  // We wanna store location in SQL db IF IT DOESN'T EXIST
  // IF IT DOES EXIST, return the data



// Geocode lookup handler
function searchToLatLong(query) {
  
  // Check SQL db for search query to see if it's there already
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`; // Why $1? Answer: protection against hacking. Takes first value in the "values" array and assigns it to $1. It's alternative to putting a template literal like ${query} into our DB query, which'd make us vulnerable to attack.
  const values = [query];           // query is e.g. 'Seattle'
  return client.query(SQL, values); // query is method on DB instance
  .then (result => {
    if (result.rowCounts > 0) {     // Checks if rows with content exist
      console.log('From SQL');
      return result.rows[0];        // An array
    } else {
      const _URL = ``;               // Add Google API URL (template literals and all)

      return superagent.get(url)
        .then(data =>
          console.log('From API');
          if (!data.body.results.length) {
            throw 'no data'
          } else {
            let location = new Location(query, data.body.results[0]); // ...results[0], b/c we want
            let newSQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;

            let newValues = Object.values(location); // Creates new location object that pulls our [...?] values and puts them into array
            console.log(`Log of "newValues": ${newValues}`);

            return client.query(newSQL, newValues)
            .then (results => {
              location.id = results.rows[0].id
            })
          }
        .catch(error => handleError);
      }    
    }
  });

  // OLD WAY TO RETRIEVE DATA
  // const geoData = require('./data/geo.json');

  // NEW WAY TO RETRIEVE DATA
  // Send API URL with query string we want
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  // OLD CODE (IS REPLACED BY BLOCK BELOW)
  // const location = new Location(query, geoData);
  // console.log('location in searchToLatLong()', location);
  // return location;

  // NEW CODE
  return superagent.get(url)
    .then(result => {
      return new Location(query, result);
    })
    .catch(error => handleError(error));
}

function Location(query, res) { // 'res' is short for 'result'
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

// Constructor needed for function getWeather()
function Weather(day) {
  this.forecast = day.summary;
  // Get Date/time on server itself (faster than requesting it from API)
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

// Weather route handler
function getWeather(request, response) {
  // Old code
  // const darkskyData = require('./data/darksky.json');

  // New code
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.send(weatherSummaries); // ???
    })
    .catch(error => handleError(error, response));
  // return weatherSummaries;
}

// TODO Meetups route handler
