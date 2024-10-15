'use strict';

const fs = require('fs');
const _path = require('path');
const _ = require('lodash');
const {globSync} = require('glob');
const express = require('express');
const swaggerUI = require('swagger-ui-express');

const SCHEMA_DIR = 'schemas';
const MANIFESTS = './schemas/**/manifest.json'
const port = process.env.PORT | 8080;
const app = express();

app.locals.port = port;

const customJs = "";

function loadSchemaList(directory=`${SCHEMA_DIR}`) {
    // find all manifests...
    const manifests = globSync(MANIFESTS, {dotRelative: true});
    const list = _(manifests)
    .map(manifest => {
        // import the manifest...
        return _(require(manifest))
        .map((path, name) => ({
            name,
            path: _path.join('/', _path.dirname(manifest), path)
        }))
        .value();
    })
    .flatten()
    .value();

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
    const options = {swaggerOptions: {url: `.${req.query.spec}`},
        customJsStr:
            'window.addEventListener("load", (event) => {document.querySelector("#swagger-ui > section > div.topbar > div > div > a").href = "/";});'
    }
    return swaggerUI.setup(null, options)(req, res, next);
});

// start the server
app.listen(port,  () => {
    console.log(`listening on port: ${port}.`);
});
