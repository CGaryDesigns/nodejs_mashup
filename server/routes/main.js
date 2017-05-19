'use strict';
const path = require('path');
const fs = require('fs');
const express = require('express');
const google = require('googleapis');
let configOptions = {};
let router = express.Router();

let youtubeAPI = google.youtube('v3');

//load the configuration file
let configPath = path.join(__dirname,'..','config.json');

//create a middleware function to get the configuration
router.use(function(req,res,next){
    try{
        configOptions = JSON.parse(fs.readFileSync(configPath,{encoding:'utf8'}));
        next();
    }catch(err){
        console.log('There was a problem reading the file at %s. The error was %s',configPath,JSON.stringify(err));
        res.send('There was a problem reading the config file.');
    }
});

router.get('',function(req,res){
    youtubeAPI.search.list({
        part:'snippet',
        q:'poledance,exercise,aerobics,pole,stripper',
        type:'',
        key:configOptions.youtube.apiKey
    },function(err,response){
        if(err){
            console.log('There was an error.  It was %s',JSON.stringify(err));
        }
        console.log('The Response was %s',JSON.stringify(response));
        res.send('the data is retrieved.');
    });
    
});

module.exports = router;


 