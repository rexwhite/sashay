'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const yaml = require('yamljs');
const express = require('express');
const swaggerUI = require('swagger-ui-express');

const SCHEMA_DIR = 'schemas';
const port = process.env.PORT | 8080;
const app = express();

app.locals.port = port;
app.locals.schemaList = {};

function loadSchemaList(directory=`${SCHEMA_DIR}`) {
    const list = [];

    // get list of schema files
    const files = fs.readdirSync(directory, {withFileTypes: true})

    for (const entry of files) {
        // descend into subdirs
        if (entry.isDirectory()) {
            const result = loadSchemaList(path.join(directory, entry.name));
            list.push(...result);
        }

        else if (entry.name === 'manifest.json') {
            // load manifest info
            const manifest = require(path.join(__dirname, entry.path, entry.name));
            for (const key in manifest) {
                list.push({name: key, path: path.join('/', directory, manifest[key])});
            }
        }
    }

    return list;
};

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('./public'));

app.get('/', (req, res) => {
        return res.set('Cache-Control', 'no-store').render('list', {apis: app.locals.schemaList});
});

const loadSchema = (file) => {
    if (file.endsWith('.yaml') || file.endsWith('*.yml')) {
        return new Promise((resolve, reject) => {
            try {
                yaml.load(path.join(SCHEMA_DIR, file), result => resolve(result));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    if (file.endsWith('.json')) {
        return fs.readFile(path.join(SCHEMA_DIR, file), 'utf8')
        .then(result => JSON.parse(result));
    }
};

const serveSchema = (req, res, next) => {
    req.swaggerDoc = loadSchema('./dispathcer/private.openapi.yaml');
    next();
};

const temp_1 = (req, res, next) => {
    next();
};

const temp_2 = (req, res, next) => {
    const options = {swaggerOptions: {url: '.' + req.path}};
    return swaggerUI.setup(null, options)(req, res, next);
};

// serve specs at link
app.use('/apidoc', temp_1, serveSchema, swaggerUI.serveFiles(), swaggerUI.setup());

// load schemas
app.locals.schemaList = loadSchemaList()

// start the server
app.listen(port,  () => {
    console.log(`listening on port: ${port}.`);
});
