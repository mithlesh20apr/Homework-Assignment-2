/*
 * Request Handlers
 *
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
var menuItems = require('./item');

// Define all the handlers
var handlers = {};

// Ping
handlers.ping = function(data,callback){
    callback(200);
};

// Not-Found
handlers.notFound = function(data,callback){
  callback(404);
};

// Users
handlers.users = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users  = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

if(helpers.validateEmail(email)){

  if(firstName && lastName && email && password && tosAgreement && streetAddress){
    // Make sure the user doesnt already exist
    _data.read('users',email,function(err,data){
      if(err){
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'email' : email,
            'streetAddress': streetAddress,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          // Store the user
          _data.create('users',email,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that email id already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
}else{
	callback(404,{'Error': 'Please enter valid email id'});
}
};

// Required data : Email id
// Optional data : firstName, lastName, password, streetAddress, tosAssesment
// Get Method of users

handlers._users.get = function(data, callback) {
	//Check that the email is valid

	var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim(): false;
	
	if(email) {
	var token = typeof(data.headers.token) == 'string' ? data.headers.token :false;
	// Verify that the given token is valid for the phone numbers
	handlers._tokens.verifyToken(token, email, function(tokenIsValid){
		if(tokenIsValid){
		_data.read('users', email, function(err, data){
			if(!err && data) {
				delete data.hashedPassword;
				callback(200, data);
			}else{
				callback(404);
			}
		});
	}else{
	  callback(403,{'Error': 'Missing required token in header, or token is valid'})
	}

});
}
	else{
		callback(400, {'Error': 'Missing required fields'});
	}
}
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.put = function(data,callback){
  // Check for required field
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

  // Check for optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
  
  if(email){

  	if(firstName || lastName || password || streetAddress){
  		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
	    handlers._tokens.verifyToken(token, email, function(tokenIsValid){
		if(tokenIsValid){
  		_data.read('users', email,function(err, userData){
  			if(!err && userData){
  			if(firstName){
  				userData.firstName = firstName;
  			}
  			if(lastName){
  				userData.lastName = lastName;
  			}
  			if(password){
  				userData.password = password;
  			}
  			if(streetAddress){
  				userData.streetAddress = streetAddress;
  			}
  			//Store the new data

  			_data.update('users', email,userData,function(err){
  				if(!err){
  					callback(200, {'Success': 'user update successfully'});
  				}else{
  					console.log(err);
  					callback(500, {'Error': 'Could not update the user'});
  				}
  			});
  		}else{
  			callback(400,{'Error' : 'Specified user does not exist.'});
  		}
  		});
  	}else{
			callback(403,{'Error': 'Missing required token in header, or token is valid'});
		}
	});
  	}else{
  		callback(400,{'Error' : 'Missing fields to update.'});
  	}
  
}else{
  	callback(400,{'Error' : 'Missing required field.'});
  }

}

//Users - delete

handlers._users.delete = function(data,callback){
	// Check that phone number is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){

  	var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
	  handlers._tokens.verifyToken(token, email, function(tokenIsValid){
	if(tokenIsValid){
			  // Lookup the user
  	_data.read('users',email,function(err,userData){
      if(!err && userData){
        _data.delete('users',email,function(err){
          if(!err){
              var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
              var checksToDelete = userChecks.length;
              if(checksToDelete > 0 ){
                var checksDeleted = 0;
                var deletionErrors = false;
                //Loop through the checks

                userChecks.forEach(function(checkId){
                  _data.delete('checks', checkId,function(err){
                    if(err){
                      deletionErrors = true;

                    }
                    checksDeleted++;
                    if(checksDeleted == checksToDelete){
                      if(!deletionErrors){
                        callback(200);
                      }else{
                        callback(500, {'Error': 'Errors encounterd while attempting to delte all of the users. All checks has been deleted successfully'});

                      }
                    }
                  });
                })
              }else{
                callback(200);
              }
          } else {
            callback(500,{'Error' : 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
    }else{
	callback(403,{'Error': 'Missing required token in header, or token is valid'});
	
		}
	});
		}else{
	callback(400,{'Error' : 'Missing required field'})
	
		}
	
}

// tokens
handlers.tokens = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

//Container for all the tokens methods
handlers._tokens = {};

//Token  -post

//Required data: email, password

handlers._tokens.post = function(data, callback){
	 var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
	 var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	if(helpers.validateEmail(email)){
	 if(email && password) {
		_data.read('users', email, function(err, userData){
			if(!err && userData){	
				var hashedPassword = helpers.hash(password);
				if(hashedPassword == userData.hashedPassword){

					var tokenId = helpers.createRandomString(20);
					var expires = Date.now() + 1000 * 60 * 60;

					var tokenObject = {
						'id': tokenId,
						'email': email,
						'expires': expires
					}

					_data.create('tokens', tokenId,tokenObject, function(err){
						if(!err){
							callback(200, tokenObject);
						}else{
							callback(500,{'Error': 'Could not create the new token'});
						}
					});


				}else{
					callback(400, {'Error': 'Email did not match the specified user\'s stored email'});
				}
			}else{
				callback(400, {'Error': 'could not find the specified user'});		
			}
		});
	}
}else{
	callback(400, {'Error': 'Please enter valid email id'});
}
}
//Tokens Get

handlers._tokens.get = function(data,callback){
	//Check that the id
	var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim(): false;
	if(id){
		_data.read('tokens', id, function(err, tokenData){
			if(!err && tokenData){
				//delete data.hashedPassword;
				callback(200, tokenData);
			}else{
				callback(404);
			}
		});
	}else{
		callback(400, {'Erro': 'Missing required field'});
	}
}

//Token put

handlers._tokens.put = function(data,callback){
	var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
 	var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
 	if(id && extend){
 		//Lookup the token
 		_data.read('tokens',id,function(err, tokenData){
 			if(!err && tokenData){
 			 //Check to the make sure the token isn't already expired
 			 if(tokenData.expires > Date.now()){
 			 	//Set the expiration an hour from now
 			 	tokenData.expires = Date.now() + 1000 * 60 * 60;

 			 	_data.update('tokens', id,tokenData, function(err){
 			 		if(!err){
 			 			callback(200);
 			 		}else{
 			 			callback(500, {'Error': 'Could not update the token\s expiration'});
 			 		}
 			 	})

 			 }else{
 			 	callback(400, {'Error': 'The token has already expired, and cannot be extended'});
 			 }
 			}else{
 				callback(400,{'Error': 'Specified token does not exist'});
 			}
 		});
 	}else{
 		callback(400, {'Error': 'Missing required field(s) or fields are invalid'});
 	}
}

// Tokens delete
handlers._tokens.delete = function(data,callback){
	var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the user
    _data.read('tokens',id,function(err,data){
      if(!err && data){
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
}



handlers._tokens.verifyToken = function(id,email,callback){
	//Lookup the token
	_data.read('tokens', id,function(err, tokenData){
		if(!err && tokenData){
			if(tokenData.email == email && tokenData.expires > Date.now()){
				callback(true);
			}else{
				callback(false);
			}
		}else{
			callback(false);
		}
	})
};

// Menu
handlers.menus = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._menus[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers._menus = {};

handlers._menus.get  = function(data, callback){
	  var email = helpers.checkandReturn(data.queryStringObject, 'email');
    if (email) {

      // Get the token from the headers
      var token = typeof data.headers.token === 'string' ? data.headers.token : false;
      handlers._tokens.verifyToken(token, email, tokenIsValid => {
        if (tokenIsValid) {
          callback(200, menuItems);
        } else {
          callback(403, { Error: 'Token invalid' });
        }
      });
    } else {
      callback(400, { Error: 'Missing email' });
    }
  },



//Orders 


//order

handlers.orders = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._orders[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers._orders = {};

handlers._orders.post  = function(data, callback){
	//Check required fields
	var email = helpers.checkandReturn(data.payload, 'email');
	var order = typeof data.payload.order === 'object' ? data.payload.order : false;
	if(email && order) {
	 // Make sure user exists
	  _data.read('users', email, (err1, userData) => {
		if(!err1 && userData) {
		//Get token from headers side
        var token = typeof data.headers.token === 'string' ? data.headers.token : false;
		// Verify that the given token is valid for the email id
		handlers._tokens.verifyToken(token, email, function (tokenIsValid){
			if(tokenIsValid) {
				var orderData = {
					firstName: userData.firstName,
					lastName: userData.lastName,
					email,
					streetAddress: userData.streetAddress,
					order
				}
			if(helpers.validateOrder(order)){
				var filename = `${email}-${Date.now()}`;
				_data.create('orders', filename, orderData, err2 => {
				var amount = helpers.calculateAmount(order);
				if(!err2) {
					var paymentDetails = {
						 amount,
						 currency: 'usd',
                         source: 'tok_visa_debit',
						 description: 'Thanks for ordering at pizza'
					}
				};
				helpers.makePayment(paymentDetails, err3 => {
					if(!err3){
						var mailDetail = {
							to: email,
							subject: 'Success! your order is confirmed',
							text: 'You will receive your order in 1 hour'
						};
						helpers.sendEmail(mailDetail, err4 =>{
							if(!err4){
								callback(200);
							}else{
								callback(500, {'Error': 'Could not send email'});
							}
						});

					}else{
						callback(500, {'Error': 'Could not create the new order'});
					}
				});
			});
		}else {
                callback(403, { Error: 'Order is not valid' });
              }
		}else {
              callback(403, { Error: 'Token is not valid' });
            }
		});
		}else {
          callback(400, { Error: 'User does not exists '});
        }
		});
		}else {
     	 callback(400, { Error: 'Missing required fields '});
    	}
		}



module.exports = handlers;