var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');
var _ = require('underscore');
var curl = require('node-curl');



app.get('/crawl', function(req, res){

url = 'http://www.alise.org/alise-membership---2014---institutional-members';

request(url, function(error, response, html){
    if (error) {
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


            for (i = 0; i < uniqueLinks.length; i++) {
                request(uniqueLinks[i]).pipe(fs.createWriteStream('page'+i+'.html'));

            };
        })
    }

        res.
            send('Check your console!')
    })
 })
  
app.listen('8081')
  
 console.log('Magic happens on port 8081');
  
exports = module.exports = app;
