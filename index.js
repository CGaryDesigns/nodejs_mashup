'use strict';

//require http and https server
let http = require('http');
let https = require('https');
//node JS core package
const path = require('path');
//express Application node module
const express = require('express');
//handlebars node module
const exphbs = require('express-handlebars');

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
let startingHost = process.env.HOST || 'localhost';
app.listen(startingPort,startingHost, function(){
   console.log('Web App Started - listening on PORT: %s', startingPort);
});