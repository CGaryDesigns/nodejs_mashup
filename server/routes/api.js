'use strict';

const path = require('path');
const express = require('express');
const fs = require('fs');
const google = require('googleapis');
let youtubeapi = google.youtube('v3');
let configOptions = {};

let configSettingPath = path.join(__dirname,'..','config.json');
let router = express.Router();

router.get('videos',function(req,res,next){
    
});

module.exports = router;

