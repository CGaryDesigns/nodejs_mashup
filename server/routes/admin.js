'use strict';

const path = require('path');
const express = require('express');
//we need to load the administrative options
const configSettings = require(path.join(__dirname) + '/confguration');                                                                  

let fileDeliveryOptions = {
    root: path.join(__dirname,'../../public/admin')
};

let router = express.Router();
router.use('/assets',express.static(path.join(__dirname,'../../public/assets')));

router.get('/',function(req,res,next){
    //actually send the file
    res.sendFile('index.html',fileDeliveryOptions,function(err){
        if(err) console.log(JSON.stringify(err));
    });
});

module.exports = router;