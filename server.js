const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));

app.use(express.static(path.join(__dirname, 'public/views')));

app.use('/js', express.static(path.join(__dirname, 'public/js')));

const port = process.env.PORT || 1111;

app.listen(port, function () {
  console.log(`Your app is listening on port ${port}`);
});
