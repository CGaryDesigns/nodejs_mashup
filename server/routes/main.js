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
    //join together the searchterms and build the query string
    let queryString = configOptions.keywords.primary.join(',');
    queryString += ' -' + configOptions.keywords.exclusive.join(',');
    youtubeAPI.search.list({
        part:'snippet',
        q:queryString,
        type:'',
        key:configOptions.youtube.apiKey
    },function(err,response){
        if(err){
            console.log('There was an error.  It was %s',JSON.stringify(err));
        }
        console.log('The Response was %s',JSON.stringify(response, null, 4));
        //res.send('the data is retrieved.');
        res.render('main',response,function(err,html){
            if(err){
                console.log('There was a problem rendering the output.');
            }
           res.send(html);
        });
    });
    
});

module.exports = router;


 