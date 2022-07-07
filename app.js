'use strict';

const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const yaml = require('yamljs');
const express = require('express');
const swaggerUI = require('swagger-ui-express');

const SCHEMA_DIR = 'schemas';
const port = process.env.PORT | 8080;
const app = express();

app.locals.port = port;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('./public'));

app.get('/', (req, res) => {
    // get list of schema files
    return fs.readdir('./schemas')
    .then((files) => {
        const list = _.filter(files,  (filename) => {
            const file = filename.toLowerCase();
            return file.endsWith('.yml') || file.endsWith('.yaml');
        });

        return res.render('hello', {apis: list});
    });
});

const loadSchema = (req, res, next) => {
    // res.send(`Loading file: ${req.params.filename}...`);
    return yaml.load(path.join(SCHEMA_DIR, req.params.filename), (result) => {
        req.swaggerDoc = result;
        console.log(`swaggerUI.serve: ${JSON.stringify(swaggerUI.serve)}`);
        next();
    });
};

// serve specs at link
app.use(`/apidoc/:filename`, loadSchema, swaggerUI.serve, swaggerUI.setup());


// start the server
app.listen(port,  () => {
    console.log(`listening on port: ${port}.`);
});
