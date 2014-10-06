nodeCrawlin
===========

##Creating a web crawler with nodeJS

###View the output @ http://crawler.srihari.guru/output.html

##Synopsis
This is a web Crawler written in NodeJS using the Kue library which uses Redis as a external queue.

The task was to crawl at the depth of two levels, and to write the output at the final desired leaf node.

##Architecture
 * NodeJS
 * Redis with Kue as an external queue (https://github.com/LearnBoost/kue)
 * Running on AWS EC2 Free Micro Tier
 * Cheerio
 * Request NPM Library
 * UnderscoreJS
 * Node FS

##The Application

There is a crawlManager which is the producer of work, and it triggers the crawl with a seedUrl.

The crawlWorkers return crawled URLs back to the manager which pushes them back into the queue to be subsequently crawled.

The actual crawling logic is implemented by using the Cheerio library, which allows us to make a request to each url and parse the DOM on the server side. In this method of implementation there is no browser/user interface neccesary, all the work is done in the console (terminal). 

In a more traditional crawler application, such as Crawler4J, one may wait up to 7000ms for each request, and in order to make up for idle time several threads are run in parallel to reduce overall compute time. By using NodeJS, we can run the same task in a computationally more efficent manner, as NodeJS runs an event-driven IO asynchronous model running all on a single thread. Since this is running on EC2, it is easy to see that the actual cost is low.

##Challenges and Things Learned

###Timeouts

Some URLs lasted longer than expected, so I had to hard code a 7000ms timeout into the logic so that the crawler would proceed if a particular page hung for too long with no response.

###File Exclusions

I had to include a list of file types to explicitly not crawl (js, bmp, video files, etc) to reduce compute time.

###Redirects

Some of the connections never reached were not due to time outs, but because I was not explicitly telling the request function to follow redirects. Once declaring the option `followAllRedirects:true`, the application was able to easily follow all the redirects and reach desired page destinations.

Questions? Feel free to email me at yolo@srihari.guru




