'use strict';
const request = require('request');
const path = require('path');
const fs = require('fs');
const express = require('express');
const google = require('googleapis');
let configOptions = {};
let router = express.Router();

let youtubeAPI = google.youtube('v3');

//load the configuration file
let configPath = path.join(__dirname,'..','config.json');

let youtubeSearchAsync = function(youtubeSearchOptions){
    return new Promise(function(resolve,reject){
        youtubeAPI.search.list(youtubeSearchOptions,function(err,response){
            if(err) reject(err);
            resolve(response);
        });
    });
};
let pintrestSearchAsync = function(queryTermArray,accessKey,resultArray){
    return new Promise(function(resolve,reject){
        let searchEndpoint = 'https://api.pintrest.com/v3/search/pins/';
        let paramsObj = {
                            'join':'via_pinner,board,pinner',
                            'pageSize':50,
                            'query':queryTermArray.join(','),
                            'access_token':accessKey
                        };
        let requestOpts = {
            baseUrl:searchEndpoint,
            method:'GET',
            headers:{

            },
            qs:paramsObj
        };
        request(requestOpts,function(err, response, body){
            if(err) {
                console.log('Response Error was: %s',JSON.stringify(err));
                reject(err);
            }
            resultArray.push(body);
            console.log('Response body: %s',JSON.stringify(body));
            console.log('Full Response: %s',JSON.stringify(response));
            resolve(resultArray);
        });
        
    });
}

//create a middleware function to get the configuration
router.use(function(req,res,next){
    try{
        configOptions = JSON.parse(fs.readFileSync(configPath,{encoding:'utf8'}));
        next();
    }catch(err){
        console.log('There was a problem reading the file at %s. The error was %s',configPath,JSON.stringify(err));
        res,status(500).end();
    }
});

router.get('',function(req,res){
    //join together the searchterms and build the query string
    let queryString = configOptions.keywords.primary.join(',');
    queryString += ' -' + configOptions.keywords.exclusive.join(',');
    let youtubeSearchOptions = {
        part:'snippet',
        q:queryString,
        type:'',
        maxResults:9,
        safeSearch:'none',
        key:configOptions.youtube.apiKey
    };
    youtubeSearchAsync(youtubeSearchOptions).then(function(results){
        return pintrestSearchAsync(configOptions.keywords.primary,configOptions.pintrest.accessKey,[results]);
    },function(err){
        console.log('There was a problem obtaining the results. %s',JSON.stringify(err));
        res.sendStatus(500).end();
    }).then(function(resultArray){
        res.render('main',resultArray[0],function(err,html){
            if(err){
                console.log('There was a problem rendering the output.');
            }
           res.send(html);
        });
    },function(err){
        console.log('There was a problem obtaining the Pintrest Results: %s',JSON.stringify(err))
        res.sendStatus(500).end();
    });
    
});

module.exports = router;


 