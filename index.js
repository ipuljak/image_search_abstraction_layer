// Server requirements
const express = require('express'),
  bodyparser = require('body-parser'),
  methodOverride = require('method-override'),
  cors = require('cors'),
  app = express();

// Routes requirements
const image_search = require('./routes/image_search');

// Server setup
app.use(cors());
app.use(bodyparser.json({ type: '*/*' }));
app.use(methodOverride('_method'));

// Server routes
app.use('/', image_search);

// Server port listen
app.listen(5003, process.env.IP, () => {
  console.log('Image Search server started on port 5003.');
});