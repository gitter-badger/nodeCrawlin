nodeCrawlin
===========

##Creating a web crawler with nodeJS

This is basically not even a 'true' web crawler yet.

The task was to crawl at the depth of one level.

Since I wasn't specified to go any deeper, I didn't find it neccesary to implement recursion yet.

Instead of using a queue and checking each value every time it is added to see whether or not it was already 
added, I am santizing the array using underscoreJS method, _.uniq, which removes duplicates from the input array.

I am then using the request library and piping the output of each of the URLs from this array of unique links
to a file stream and saving the web sites to html.

