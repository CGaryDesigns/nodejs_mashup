'use strict';

const path = require('path');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
let configOptions = {};
//we need to load the administrative options
let configSettingPath = path.join(__dirname,'..','config.json');
let router = express.Router();
let upload = multer();
router.use('/assets',express.static(path.join(__dirname,'../../public/assets')));
//this is a generic middleware function that will load the config setting for
//the admin settings
router.use(function(req,res,next){
    console.log('Reading file at location %s',configSettingPath);
    try{
        configOptions = JSON.parse(fs.readFileSync(configSettingPath,{encoding:'utf8'}));
    }catch(err){
        console.log('Config file not found, need to create config options. Was looking for %s',configSettingPath);
        configOptions = {
            siteName:'Mashup Application',
            siteDescription:'Site Description',
            keywords:{
                primary:[],
                secondary:[],
                inclusive:[],
                exclusive:[]
            },
            ebay:{
                appId:'',
                devId:'',
                certId:''
            },
            youtube:{},
            articleFeeds:{}
        };
    }
    next();
});

router.get('/keywords',function(req,res,next){
   let configInfo = {path:req.path, config:configOptions};
   res.render('adminkeywords',configInfo,function(err,html){
      if(err){
          console.log('There was a problem rendering the data. The error was the following: %s',err);
      } 
      res.send(html);
   });
});
router.post('/keywords',upload.array(),function(req,res,next){
   let configInfo = {path:req.path, config:configOptions};
   configInfo.config.keywords.primary = req.body.primaryKeywords.split(',');
   configInfo.config.keywords.secondary = req.body.secondaryKeywords.split(',');
   configInfo.config.keywords.inclusive = req.body.inclusionKeywords.split(',');
   configInfo.config.keywords.exclusive = req.body.exclusionKeywords.split(',');
   fs.writeFile(configSettingPath,JSON.stringify(configInfo.config),'utf8',function(err){
       if(err){
           console.log('There is a problem with writing the file. The error is the following: ' + JSON.stringify(err));
       }
   });
   
   res.render('admin',configInfo,function(err,html){
       if(err){
           console.log('There was a problem with the render. The problem was the following: %s',JSON.stringify(err));
       }
       res.send(html);
   })
});

router.get('/youtube',function(req,res,next){
    let configInfo = {path:req.path, config:configOptions}
    res.render('adminyoutube',configInfo,function(err,html){
        if(err){
            console.log('There was an error rendering the view. The Problem was the following: %s',JSON.stringify(err));
        }
        res.send(html);
    })
})
router.post('/youtube',upload.array(),function(req,res,next){
    let configInfo = {path:req.path, config:configOptions};
    configInfo.config.youtube.apiKey = req.body.youtubeAPIKey;
    fs.writeFile(configSettingPath,JSON.stringify(configInfo.config),'utf8',function(err){
        if(err){
            console.log('There was a problem with writing the file. The error was: %s',JSON.stringify(err));
        }
    });
    res.render('admin',configInfo,function(err,html){
        if(err){
            console.log('There was a problem in the render. The problem was the following: %s', JSON.stringify(err));
        }
        res.send(html);
    });
});

router.get('/',function(req,res,next){
    let configInfo = {path: req.path, config:configOptions};
    console.log('Config Info: %s',JSON.stringify(configInfo));
    res.render('admin', configInfo, function(err,html){
        if(err){
            console.log('There was a problem in the render. The problem was the following: %s', JSON.stringify(err));
        }
        //console.log('The data passed to the template was the following: %s',JSON.stringify(configInfo));
        res.send(html);
    });
});
router.post('/',upload.array(),function(req,res,next){
    let configInfo = {path: req.path, config:configOptions};
    //save the values that have been updated
    configInfo.config.siteDescription = req.body.siteDescription;
    configInfo.config.siteName = req.body.siteName;
    //write the configuration
    fs.writeFile(configSettingPath,JSON.stringify(configInfo.config),'utf8',function(err){
       if(err){
           console.log('There was a problem saving config data. It was the following: ' + JSON.stringify(err));
       } 
    });
    
    res.render('admin',configInfo,function(err,html){
      if(err){
          console.log('There was a problem in the render. The problem was the following: %s', JSON.stringify(err));
      }
      res.send(html);
    }); 
});
router.route('/ebay')
    .get(function(req,res){
        let configInfo = {path: req.path, config: configOptions};
        console.log(JSON.stringify(configInfo));
        res.render('adminebay',configInfo,function(err,html){
            if(err){
                console.log('Tere was a problem with the render. The problem was the following: %s',JSON.stringify(err));
            }
            res.send(html);
        });

    })
    .post(upload.array(),function(req,res){
        let configInfo = {path: req.path, config: configOptions};
        configInfo.config.ebay.appId = req.body.EBayAppId;
        configInfo.config.ebay.devId = req.body.EBayDevId;
        configInfo.config.ebay.certId = req.body.EBayCertId;
        //write the configuration
        fs.writeFile(configSettingPath,JSON.stringify(configInfo.config),'utf8',function(err){
            if(err){
                console.log('There was a problem with saving the config data. The problem was %s',JSON.stringify(err));
            }
        });
        res.render('adminebay',configInfo,function(err,html){
            if(err){
                console.log('There was a problem rendering. The problem was %s',JSON.stringify(err));
            }
            res.send(html);
        });
    });

module.exports = router;