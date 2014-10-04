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

var sequence = 0;

/*setInterval(
    function() {
        sequence +=1;
        (function(sequence){

            var job = jobs.create('email',{
                title:'Hello # ' + sequence
                ,to: 'harirao3@gmail.com'
                ,body: 'hello from kue!'
            }).save();

            job.on('complete', function(){
                console.log('job '+ sequence +' completed');
            });
            job.on('failed', function(){
                console.log('job '+ sequence +'  failed');
            });
        })(sequence)
    }
    ,1000
);*/

/*

nextCrawl=function(level,urls){
    urls.forEach(function(oneUrl, index,urls){
        console.log("urls : ", oneUrl , " added to queue for crawling " ,level ,"deep");

    });
}*/


    sequence += 1;
    var crawlUrls= function (level,urlsToCrawl) {
        urlsToCrawl.forEach(oneUrl,index)
        {
            var crawlJob = jobs.create('url', {
                url: oneUrl
               , level:level
            }).save();
        }
        var job = jobs.create('url', {
            url: 'http://www.alise.org/alise-membership---2014---institutional-members'
           ,level: 1
        }).save();

        job.on('complete', function (result) {
            console.log('job ' + sequence + ' results: ', result);

        });
        job.on('failed', function () {
            console.log('job ' + sequence + '  failed');
        });
    }(sequence);



