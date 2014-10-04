/**
 * Created by kingHenry on 10/4/14.
 */
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');
var _ = require('underscore');
var kue = require('kue'),
    jobs=kue.createQueue();


var seedUrl=['http://www.alise.org/alise-membership---2014---institutional-members'];

//----------------------------------------------------------

var crawlUrls= function (level,urlsToCrawl,breadcrumb) {
    var myJobs = [];
    var bCrumb="seedUrl";
    urlsToCrawl.forEach(function(oneUrl,index)
    {
        if(breadcrumb != "seedURL"){
            bCrumb=breadcrumb+'|'+oneUrl;
        }

        var crawlJob = jobs.create('url', {
            url: oneUrl
           ,level:level+1
           ,breadcrumb:bCrumb
        }).save();
        myJobs.push(crawlJob)
    });

    console.log( "Firing " + myJobs.length + " jobs for" + bCrumb);

    myJobs.forEach(function(job,index)
    {

      job.on('complete',function(result){
          console.log( "Done for " +  job.data.breadcrumb)
          if (result.level<2){
              console.log('cb level: '+(result.level+1))
              crawlUrls(result.level,result.foundUrls,result.breadcrumb)

          }

      })
      job.on('failed', function(error){
          console.log ("Failure for " + job.data.breadCrumb )
      })
    });
};

//------------------------------------------
// MAIN 

crawlUrls(0,seedUrl,"seedURL");
kue.app.listen(3000)
