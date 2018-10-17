
// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const tokens = require('./handlers');
var config = require('./config');
const menuItems = require('./item');

function validateOrder(order) {
  return order.reduce((acum, value) => {
    const isItemInMenu = menuItems.find(elem => elem.code === value);
    return Boolean(isItemInMenu && acum);
  }, true);
}

function calculateAmount(order) {
  return order.reduce((sum, value) => {
    const findInMenu = menuItems.find(elem => elem.code === value);
    return sum + findInMenu.price;
  }, 0);
}

// orderHandlers
module.exports = {

  post(data, callback) {
    // check required fields
    const email = helpers.checkAndReturn(data.payload, 'email');
    const order = typeof data.payload.order === 'object' ? data.payload.order : false;
    if (email && order) {
      // Make sure user exists
      _data.read('users', email, (err1, userData) => {
        if (!err1 && userData) {
          // Get token from headers
          const token = typeof data.headers.token === 'string' ? data.headers.token : false;

          // Verify that the given token is valid for the phone number
          tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
              const orderData = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email,
                streetAddress: userData.streetAddress,
                order,
              };
              if (validateOrder(order)) {
                const fileName = `${email}-${Date.now()}`;
                _data.create('orders', fileName, orderData, err2 => {
                  const amount = calculateAmount(order);
                  if (!err2) {
                    const paymentDetails = {
                      amount,
                      currency: 'INR',
                      source: 'tok_visa_debit',
                      description: 'Thanks for ordering at Pepe\'s pizza!',
                    };
                    helpers.makePayment(paymentDetails, err3 => {
                      if (!err3) {
                        const mailDetail = {
                          to: email,
                          subject: 'Success! Your order is confirmed',
                          text: 'You will receive your order in 1 hour',
                        };
                        helpers.sendEmail(mailDetail, err4 => {
                          if (!err4) {

                            callback(200);
                          } else {
                            callback(500, { Error: 'Could not send email '});
                          }
                        });
                      } else {
                        callback(500, { Error: 'Could not create the new order '});
                      }
                    });
                  } else {
                    callback(500, { Error: 'Could not create the new order '});
                  }
                });
              } else {
                callback(403, { Error: 'Order is not valid' });
              }
            } else {
              callback(403, { Error: 'Token is not valid' });
            }
          });

        } else {
          callback(400, { Error: 'User does not exists '});
        }
      });
    } else {
      callback(400, { Error: 'Missing required fields '});
    }
  },


};
