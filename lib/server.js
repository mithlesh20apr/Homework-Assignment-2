/*
 * Server related tasks/
 *
*/

//Dependencies

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers =require('./handlers');
var helpers = require('./helpers');
var path = require('path');

//Instantiate the server module

var server = {};

server.httpServer = http.createServer(function(req, res){
  server.unifiedServer(req, res);
});

//Instantiate the https server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert':fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res){
  server.unifiedServer(req, res);
});



server.unifiedServer = function(req, res){
  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : helpers.parseJsonToObject(buffer)
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode,payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log("Returning this response: ",statusCode,payloadString);

      });

  });
}
//server router
server.router = {
  'users': handlers.users,
  'tokens': handlers.tokens,
  'orders': handlers.orders,
  'menus' : handlers.menus
 };


//Init script

server.init = function(){
  //Start the http server

  // Start the server
server.httpServer.listen(config.httpPort,function(){
  console.log('The server is up and running now '+config.httpPort);
});

//Start the Https server
server.httpsServer.listen(config.httpsPort,function(){
  console.log('The server is up and running now '+config.httpsPort);
});
}

//Export the app

module.exports = server;