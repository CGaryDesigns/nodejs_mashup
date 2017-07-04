'use strict';
const request = require('request');
const FeedParser = require('feedparser');
const path = require('path');
const fs = require('fs');
const express = require('express');
const google = require('googleapis');
const ebay = require('ebay-api');
let configOptions = {};
let router = express.Router();

let youtubeAPI = google.youtube('v3');

//load the configuration file
let configPath = path.join(__dirname,'..','config.json');
//this method is designed to call the youtube API to get
//videos related to search parameters, returns Promise
let youtubeSearchAsync = function(youtubeSearchOptions){
    return new Promise(function(resolve,reject){
        youtubeAPI.search.list(youtubeSearchOptions,function(err,response){
            if(err) reject(err);
            resolve(response);
        });
    });
};
//this method is designed to retrieve a Pintrest RSS feed
//and parse it for the mashup. Returns a promise
let pintrestSearchAsync = function(urlItem,resultArray){
    let feedData = [];
    return new Promise(function(resolve,reject){
        let req = request(urlItem);
        let feed = new FeedParser({addmeta:false});
        //request events defined
        req.on('response',function(res){
            res.pipe(feed);
        });
        req.on('end',function(req){
            console.log('Response Complete: ');
        });
        //feedparser events defined
        feed.on('error',function(err){
            if(err) reject(err);
        })
        feed.on('end',function(err){
            if(err) reject(err);
            if(feedData.length > 0) resultArray.push(feedData);
            resolve(resultArray);
        });
        feed.on('readable',function(){
            let readableItem;
            while(readableItem = this.read()){
                feedData.push(readableItem);
                console.log(JSON.stringify(readableItem,null,4));
            }
        });

        
    });
}
//this method is designed to return a list of items 
//from EBay. returns a Promise.
let ebaySearchAsync = function(resultArray){
    return new Promise(function(resolve,reject){
        resolve(resultArray);
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
        return pintrestSearchAsync(configOptions.pintrest.rssFeed,[results]);
    },function(err){
        console.log('There was a problem obtaining the results. %s',JSON.stringify(err));
        res.sendStatus(500).end();
    }).then(function(resultArray){
        let contentData = {context:'Main Data',youtubeData:resultArray[0],pintrestData:resultArray[1]};
        res.render('main',contentData,function(err,html){
            if(err){
                console.log('There was a problem rendering the output. The problem was %s',JSON.stringify(err,null,4));
            }
           res.send(html);
        });
    },function(err){
        console.log('There was a problem obtaining the Pintrest Results: %s',JSON.stringify(err))
        res.sendStatus(500).end();
    });
    
});

module.exports = router;


 