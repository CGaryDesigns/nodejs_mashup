'use strict';

//require http and https server
let http = require('http');
let https = require('https');
//need file systems in order to read certs
const fs = require('fs');
//node JS core package
const path = require('path');
//express Application node module
const express = require('express');
//handlebars node module
const exphbs = require('express-handlebars');

//lets get the security certificates
let privateKey = fs.readFileSync(path.join(__dirname,'certificates/node-selfsigned.key'),'utf8');
let certificate = fs.readFileSync(path.join(__dirname,'certificates/node-selfsigned.crt'),'utf8');
let credentials = {key:privateKey, cert: certificate};

//for our express handlebars, lets set up some basic configuration
//options
let expConfigOptions = {
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname,'views/layouts'),
    partialsDir: [path.join(__dirname,'views/partials')],
    helpers: {
        arrayToList : function(incomingArray){
            if(incomingArray == null || incomingArray === 'undefined'){
                return '';
            } else {
                return incomingArray.join(',');
            }
        }
    }
};


//inclusion of the routes
let admin = require('./server/routes/admin');
let api = require('./server/routes/api');
let main = require('./server/routes/main');

//creation of the express application and
//setting of the static/virtual folders
const app = express();



//creation of the routes
app.use('/admin',admin);
app.use('/api',api);
app.use('/',main);

//association of the handlebars templating modules with
//the express render engine
app.engine('handlebars',exphbs.create(expConfigOptions).engine);
app.set('view engine','handlebars');

//bootstrapping of the application
let startingPort = process.env.PORT || 3000;
let startingSecurePort = process.env.SECPORT || 8443;
let startingHost = process.env.HOST || 'localhost';

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials,app);

httpServer.listen(startingPort,function(){
    console.log('Web App Started -listening on PORT: %s', startingPort);
});
httpsServer.listen(startingSecurePort,function(){
    console.log('Web App Started -listening on PORT: %s', startingSecurePort);
});