var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');
var _ = require('underscore');
var curl = require('node-curl');



app.get('/scrape', function(req, res){

url = 'http://www.alise.org/alise-membership---2014---institutional-members';

request(url, function(error, response, html){
    if (error) {
    } else {
        var $ = cheerio.load(html);



        $('body').filter(function () {
            var data = $(this);

            var links = [];

            data.find('a').each(function () {

                //console.log(typeof linkName);
                //console.log(this.attribs.href);
                var actualLink = String(this.attribs.href)
                //console.log(typeof actualLink);
                if (typeof actualLink === 'string') {
                    //console.log(actualLink);
                    links.push(actualLink);


                }


            });
            links.splice(0, 1);

            var absLinks = [];
            links.forEach(function (actualLink, index, allItems) {
                //console.log(typeof actualLink);

                if ((actualLink.indexOf("http:")) != -1) {
                    absLinks.push(actualLink);
                }
            });


            var uniqueLinks = _.uniq(absLinks);
            console.log(uniqueLinks[0]);

            /*async.each(uniqueLinks, request(uniqueLinks,function(error,response,body){
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }), function (err){
                if(!err){
                    console.log('yay')
                }else(console.log(err));
            });*/
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
