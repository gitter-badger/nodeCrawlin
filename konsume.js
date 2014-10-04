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


// app.listen('8081')

console.log('Start Consumer')

jobs.process('url',function(job,done){
    url = job.data.url;
    breadcrumb=job.data.breadcrumb;
    level=job.data.level;
    console.log( "Processing  Job " + breadcrumb + "................" )

    request(url, function(error, response, html){
        if (error) {
            console.log ("req ERR for " + url)
            console.log(error)
        } else {
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
                //console.log(uniqueLinks);
                var i = 0;


                /*for (i = 0; i < uniqueLinks.length; i++) {
                    //request(uniqueLinks[i]).pipe(fs.createWriteStream('page'+i+'.html'));
                };*/
                console.log(uniqueLinks);
                var returnResults = {
                    foundUrls:uniqueLinks,
                    breadcrumb:breadcrumb,
                    level:level
                };
                console.log ("Done ... " + breadcrumb )
                done(null,returnResults)
            })
        }
    })   // request
});   // jobs

