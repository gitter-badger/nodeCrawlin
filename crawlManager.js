/**
 * Created by kingHenry on 10/4/14.
 */
var express = require('express');
var fs = require('fs-extra');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');
var _ = require('underscore');
var colors=require('colors') ;
var kue = require('kue'),
    jobs=kue.createQueue();


var  goodSeed=['http://www.alise.org/alise-membership---2014---institutional-members'];
var  badSeed1=['http://www.library.ualberta.ca/'] ;
var  badSeed2=['http://www.sis.uottawa.ca/'] ;

var  seedUrl=goodSeed

//----------------------------------------------------------

var dontCrawl= [
".png", ".gif", ".css", ".js", ".bmp", ".tiff", ".mid", ".mp2", ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mpeg",
".ram", ".m4v", ".pdf", ".rm", ".smil", ".wmv", ".swf", ".wma", ".tgz", ".gz", ".rar", ".zip", ".jpeg", "rss2", ".xml"
]

var crawlUrls= function (level,urlsToCrawl,breadcrumb) {
    var myJobs = [];
    var bCrumb="seedUrl";
    urlsToCrawl.forEach(function(oneUrl,index)
    {
        if(breadcrumb != "seedURL"){
            bCrumb=breadcrumb+'|'+oneUrl;
        }

        skipUrl=false
        for (i=0; i<dontCrawl.length; i++ ) {
           if ( oneUrl.indexOf( dontCrawl[i] ) != -1 ) {
               skipUrl=true
               break
           }
        }

        if  ( ! skipUrl) {
            var crawlJob = jobs.create('url', {
                url: oneUrl
               ,level:level+1
               ,breadcrumb:bCrumb
            }).save();
            myJobs.push(crawlJob)
        } else  {
             console.log ("Skipping " + oneUrl)
        }
    });

    console.log( "Firing " + myJobs.length + " jobs for" + bCrumb);
    var jobCount=0;
    myJobs.forEach(function(job,index)
    {

      job.on('complete',function(result){
          jobCount+=1;
          console.log( jobCount+ " Done Got: " + result.foundUrls.length + " Urls for "  +  job.data.breadcrumb)

          if (result.level<3){
              console.log('cb initiating level: '+(result.level+1))
              crawlUrls(result.level,result.foundUrls,result.breadcrumb)
          } else {
              lvl3UrlArray=result.foundUrls;
              
              lvl3Breadcrumb='<b>'+result.breadcrumb+'</b></br>\n<ul>\n';
              fs.appendFile('output.html',lvl3Breadcrumb,function(err){
               if(err){
                 console.log(err);
                }
              });
              for (i=0;i<lvl3UrlArray.length;i++){
                 var theUrl= "<li><a href="+lvl3UrlArray[i]+">"+lvl3UrlArray[i]+"</a></br>\n</li>\n"
                  fs.appendFile('output.html',theUrl,function(err){
                    if(err){
                     console.log(err);
                   }
                    
                  });
              }

                  fs.appendFile('output.html','</ul>',function(err){
                    
                    if(err){
                     console.log(err);
                   }
                    
                  });
              }
              console.log ("LVL3 -->", result.foundUrls)


      })
      job.on('failed', function(error){
          console.log (jobCount + " Failure for " + job.data.breadcrumb )
      })
    });
};

//------------------------------------------
// MAIN 

crawlUrls(0,seedUrl,"seedURL");
// kue.app.listen(3000)
