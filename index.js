/*
 * Primary files
 *
*/

//Dependencies

var server = require('./lib/server');

var app = {};

app.init = function(){
	//Server start the server

	server.init();
}
app.init();


//Moudle exports app

module.exports = app;
