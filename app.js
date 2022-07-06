'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT | 8080;

app.get('/', (req, res) => {
    res.render('hello.jade');
});

// get list of swagger specs
// generate home page that lists links to loaded specs
// serve specs at link

app.listen(port,  () => {
    console.log(`listening on port: ${port}.`);
});