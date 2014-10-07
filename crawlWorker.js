/**
 * Created by kingHenry on 10/4/14.
 */
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
var colors= require('colors') ;
require('v8-profiler');


// app.listen('8081')

console.log('Start Consumer')

var blackList=[
   'http://www.library.ualberta.ca/' ,
   'http://www.dustars.com/',
   'http://www.arts.uottawa.ca/eng/programs/aboriginalstudies.html',
   'http://www.research.uottawa.ca/resources-funding-infrastructure.html',
   'http://www.uottawa.ca/academic/info/regist/calendars/index.html?expandNavSection=stud-section',
   'http://instagram.com/catholicuniversity',
   'http://www.clariongoldeneagles.com/',
   'http://www.youtube.com/user/ClarionUniversity1'
]

jobs.process('url',function(job,done){
    url = job.data.url;
    breadcrumb=job.data.breadcrumb;
    level=job.data.level;
    console.log( "Processing  Job ".green + breadcrumb + "................" )
    if ( _.contains(blackList, url) ) {
        console.log("Skip blacklisted ..".cyan)
        done("blackListed")
    }

    request( {url: url, timeout: 7000, followAllRedirects:true }, function(error, response, html){
        if (error) {
            console.log ("req ERR for " + error)
            done(error)
        } else {
            urlOuterResp=response.request.uri.href
            var $ = cheerio.load(html);
            $('body').filter(function () {
                var data = $(this);
                var links = [];
                data.find('a').each(function () {
                    var actualLink = String(this.attribs.href)
                    if (typeof actualLink === 'string') {
                        links.push(actualLink);
                    }
                });
                links.splice(0, 1);

                var absLinks = [];
                links.forEach(function (actualLink, index, allItems) {
                    if ((actualLink.indexOf("http:")) != -1) {
                        absLinks.push(actualLink);
                    }
                });

                var uniqueLinks = _.uniq(absLinks);

                var onlyUnivs=[];
                if (level==3) {
                    respCount=0 ;  goodUrlCount=0

                    for(var i=0;i<uniqueLinks.length;i++) {
                        url=uniqueLinks[i]
                        request( {url: url, timeout: 7000, followAllRedirects:true }, function(error2, response2, html2){
                            respCount+=1
                            if (error2) {
                                console.log ("Level3-ERR for " + response)
                                console.log(error2)
                            } else {
                                urlInnerResp=response2.request.uri.href    // response2 for the URL we had asked a while back
                                var $$ = cheerio.load(html2);
                                $$('title').filter(function () {
                                    var univs=$$(this);
                                    var titleText = univs.text();
                                    if( titleText.indexOf("niversity")!=-1||titleText.indexOf("ollege")!=-1){
                                        console.log(urlInnerResp, "University/College found ..".bold.blue)
                                        onlyUnivs.push(urlInnerResp);
                                        goodUrlCount+=urlInnerResp
                                    } else {
                                        console.log(urlInnerResp,"NOT a College".red)
                                    };
                                });
                            }
                            if ( respCount == uniqueLinks.length  ) {
                                var results = {
                                    foundUrls: onlyUnivs
                                    ,breadcrumb:breadcrumb
                                    ,level:level
                                };
                                console.log ("Lvl3 Done ... ".cyan ,  breadcrumb )
                                done(null,results);
                            }

                        });
                    }

                    
                } else {
                    // console.log("KKKKKKKK")
                    var returnResults = {
                        foundUrls:uniqueLinks,
                        breadcrumb:breadcrumb,
                        level:level
                    };
                    console.log ("Done ... ".yellow + breadcrumb )
                    done(null,returnResults)
                }
            })
        }
    })   // request
});   // jobs

var isACollege = function(url){
    // var retVal=false
    //console.log( retVal, " isACollege ".cyan, retVal )
    //return retVal
}
