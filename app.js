'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT | 8080;

app.locals.port = port;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('./public'));

const data = {
    apis: [
        'playbook-dispatcher',
        'playbook-dispatcher internal',
        'remediations',
        'sources'
    ]
};

app.get('/', (req, res) => {
    res.render('hello', data);
});

// get list of swagger specs
// generate home page that lists links to loaded specs
// serve specs at link

app.listen(port,  () => {
    console.log(`listening on port: ${port}.`);
});