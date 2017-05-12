'use strict';

const fs = require('fs');
const path = require('path');
let configObj = {};

//we need to determine if the configuration setting file exists
let configSettingPath = path.join(__dirname,'..');
fs.readFile(configSettingPath + 'config.json',function(err,data){
   if(err){
       //there was a problem, we need to create the Object from Scratch
       configObj = {
           siteName:'Mashup Application',
           siteDescription:'This is a most basic description of the Mashup Application',
           keywords: [],
           ebay:{
               
           },
           youtube:{
               
           }
       };
   } else {
       configObj = JSON.parse(data)
   }
});

module.exports = configObj;