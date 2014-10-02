sendRequest = function() {
  xhr= new XMLHttpRequest(); 
  xhr.open('POST', '/api/redis/add'); 
  var id = Math.floor(Math.random()*1000000); 
  xhr.send(id); 
  return "id="+id; 
}

sendRequests = function(x) {
  for( var i = 0; i < x; i++ ) { 
    sendRequest(); 
  }
}

sendRequests(5000);