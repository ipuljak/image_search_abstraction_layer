const express = require('express'),
  moment = require('moment'),
  mysql = require('mysql'),
  axios = require('axios'),
  secrets = require('../config'),
  router = express.Router();

// Connect to the mysql database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'image_user',
  password: secrets.password,
  database: 'image_search'
});

/**
 *  GET search call. Obtains images from imgur. To use:
 *    http://localhost:5003/imagesearch/{your_search_term}?offset={your_page_number}
 *    where the offset is an optional integer to search through different pages of images
 */
router.get('/imagesearch/:search', (req, res) => {
  // Set the offset to be page 1 if no offset is given
  let offset = (req.query.offset ? req.query.offset : '1');
  let URL = 'https://api.imgur.com/3/gallery/search/' + offset + '/?q=' + req.params.search;

  // Insert the search term into our database
  connection.query('INSERT INTO latest SET ?', { term: req.params.search }, (error, results, fields) => {
    if (error) throw error;
  });

  // Make a GET request to imgur's API
  axios.get(URL, {
    headers: { Authorization: 'Client-ID ' + secrets.clientID }
  })
    .then((response) => {
      // Filter the data for just the title, url, and views
      let data = response.data.data.map((item) => {
        return ({
          title: item.title,
          url: item.link,
          views: item.views
        });
      });
      // Send the filtered data back to the user
      res.send(data);
    })
    // If there is an error with the API request, send it back to the user
    .catch((error) => {
      res.send({ error: 'There was an error with your request' });
    });
});

/**
 *  GET latest call. Obtains the last ten items searched. To use:
 *    http://localhost:5003/latest/imagesearch/
 */
router.get('/latest/imagesearch', (req, res) => {
  // Make the call to our database to obtain the last ten items
  connection.query(
    'SELECT * FROM \
    (SELECT * FROM latest ORDER BY id DESC LIMIT 10) \
    sub ORDER BY id DESC', (error, results, fields) => {
      if (error) throw error;
      let data = results.map((item) => {
        return ({
          term: item.term,
          when: item.when_time
        });
      });
      // Send the filtered data back to the user
      res.send(data);
    });
});

module.exports = router;