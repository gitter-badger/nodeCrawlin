/**
 * Created by kingHenry on 10/1/14.
 vi: sw=4 ts=4 expandtab
 */

var NR = require("node-resque");

///////////////////////////
// SET UP THE CONNECTION //
///////////////////////////

var connectionDetails = {
    host:      "127.0.0.1",
    password:  "",
    port:      6379,
    database:  0
}
//////////////////////////
// DEFINE WORKER TASK  //
////////////////////////
var jobs = {
    "crawl": {
        perform: function(level,url,callback){
            if(level<4){
                console.log("entering : ",level,url)
                nextCrawl(level,[url]);
            }
        }
    }
};

////////////////////
// START A WORKER //
////////////////////
var worker = new NR.worker({connection: connectionDetails, queues: ['qrl']}, jobs, function(){
    worker.workerCleanup(); // optional: cleanup any previous improperly shutdown workers
    worker.start();
});


///////////////////////
// START A SCHEDULER //
///////////////////////

var scheduler = new NR.scheduler({connection: connectionDetails}, function(){
    scheduler.start();
});

/////////////////////////
// REGESTER FOR EVENTS //
/////////////////////////

worker.on('start',           function(){ console.log("worker started"); })
worker.on('end',             function(){ console.log("worker ended"); })
worker.on('cleaning_worker', function(worker, pid){ console.log("cleaning old worker " + worker); })
worker.on('poll',            function(queue){ console.log("worker polling " + queue); })
worker.on('job',             function(queue, job){ console.log("working job " + queue + " " + JSON.stringify(job)); })
worker.on('reEnqueue',       function(queue, job, plugin){ console.log("reEnqueue job (" + plugin + ") " + queue + " " + JSON.stringify(job)); })
worker.on('success',         function(queue, job, result){ console.log("job success " + queue + " " + JSON.stringify(job) + " >> " + result); })
worker.on('failure',         function(queue, job, failure){ console.log("job failure " + queue + " " + JSON.stringify(job) + " >> " + result); })
worker.on('error',           function(queue, job, error){ console.log("error " + queue + " " + JSON.stringify(job) + " >> " + error); })
worker.on('pause',           function(){ console.log("worker paused"); })

scheduler.on('start',             function(){ console.log("scheduler started"); })
scheduler.on('end',               function(){ console.log("scheduler ended"); })
scheduler.on('error',             function(error){ console.log("scheduler error >> " + error); })
scheduler.on('poll',              function(){ console.log("scheduler polling"); })
scheduler.on('working_timestamp', function(timestamp){ console.log("scheduler working timestamp " + timestamp); })
scheduler.on('transferred_job',    function(timestamp, job){ console.log("scheduler enquing job " + timestamp + " >> " + JSON.stringify(job)); })


////////////////////////
// CONNECT TO A QUEUE //
////////////////////////
seedUrl='http://www.alise.org/alise-membership---2014---institutional-members';


var queue = new NR.queue({connection: connectionDetails}, jobs,function(){
    nextCrawl=function(level,urls){
        urls.forEach(function(oneUrl, index,allUrls){
            console.log("callback", level)
            queue.enqueue('qrl','crawl',[level+1, oneUrl])
        });

    }
    queue.enqueue('qrl','crawl',[0,seedUrl]);
});




