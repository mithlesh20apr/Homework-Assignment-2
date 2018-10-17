/*
 * helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');
var menuItems = require('./item');


// Container for all the helpers
var helpers = {};
//Parse JSON string to an object in all cases, without throwing

helpers.parseJsonToObject = function(str) {
	try{

		var obj = JSON.parse(str);

		return obj;

	}catch(e){

		return {};
	}
}

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};


// Create email helpers

helpers.validateEmail = function(email){    
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    {
        return (true)
    }
    return (false);
}




// Email configurations

helpers.checkandReturn = function (data, field, options = {}) {

  var { length, asBoolean } = options;
  if (asBoolean && typeof data[field] !== 'boolean') return false;
  if (asBoolean) return Boolean(data[field]);
  if (typeof data[field] !== 'string') return false;
  if (data[field].trim().length === 0) return false;
  if (length && data[field].trim().length !== length) return false;
  return data[field].trim();

};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

helpers.validateOrder = function (order) {
  return order.reduce((amount, value) => {
    var isItemInMenu = menuItems.find( elem => elem.code === value);
    return Boolean(isItemInMenu && amount);
  }, true);
};

helpers.calculateAmount = function(order) {
  return order.reduce((sum, value) => {
    const findInMenu = menuItems.find(elem => elem.code === value);
    return sum + findInMenu.price;
  }, 0);
}

helpers.makePayment = function (data, callback) {

  var payload = {
    amount: data.amount * 100, // amount in rupess
    currency: data.currency,
    source: data.source,
    description: data.description
  };

  var stringPayload = querystring.stringify(payload);

  var requestDetails = {
    protocol: 'https:',
    hostname: 'api.stripe.com',
    port: 443,
    method: 'POST',
    path: '/v1/charges',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload),
      Authorization: `Bearer ${config.stripe.secretKey}`
    }
  };

  // Instantiate the request object
  var req = https.request(requestDetails, res => {
    // Grab the status of the sent request
    var status = res.statusCode;
    // Callback successfully if the request went through
    if (status === 200 || status === 201) {
      callback(false);
    } else {
      callback('Status code returned was ' + status);
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error', err => {
    callback(err);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();

};

//Mail 

helpers.sendEmail = function (data, callback) {

  var payload = {
    from: config.mailgun.from,
    to: data.to,
    subject: data.subject,
    text: data.text,
  };

  var stringPayload = querystring.stringify(payload);

  var requestDetails = {
    auth: 'api:' + config.mailgun.apiKey,
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    method: 'POST',
    path: '/v3/' + config.mailgun.domainName + '/messages',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  // Instantiate the request object
  var req = https.request(requestDetails, res => {
    // Grab the status of the sent request
    var status = res.statusCode;
    // Callback successfully if the request went through
    if (status === 200 || status === 201) {
      callback(false);
    } else {
      callback('Status code returned was ' + status);
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error', err => {
    callback(err);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();

};

// Export the module
module.exports = helpers;