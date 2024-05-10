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
            const manifest = require(path.join(__dirname, directory, entry.name));
            for (const key in manifest) {
                list.push({name: key, path: path.join('/', directory, manifest[key])});
            }
        }
    }

    return list;
};

// load schema list
const schemaList = loadSchemaList();

app.set('view engine', 'pug');
app.set('views', './views');

app.use('/apidoc/schemas/', express.static('./schemas'));

app.get('/', (req, res) => {
        return res.set('Cache-Control', 'no-store').render('list', {apis: schemaList});
});

app.use('/apidoc', swaggerUI.serve, (req, res, next) => {
    const options = {swaggerOptions: {url: `.${req.query.spec}`}}
    return swaggerUI.setup(null, options)(req, res, next);
});

// start the server
app.listen(port,  () => {
    console.log(`listening on port: ${port}.`);
});
