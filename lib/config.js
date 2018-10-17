/*
	* Create and export configuration variables
	*
    *
*/

//Container for all the environments

var environments = {};
//Staging (default) environments
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'stripe': {
    'secretKey': 'sk_test_J3lxj7EID03OOfYjKB7h6oyD'
  },
  'mailgun': {
    'domainName': 'sandbox12a87ee15d4c4c57a01c6320ed14d74f.mailgun.org',
    'apiKey': '6b5b57df6f416c052d7bcde9118c8333-a3d67641-29c0931f',
    'from': 'aditya20apr@sandbox12a87ee15d4c4c57a01c6320ed14d74f.mailgun.org'
  }
}

//Production environments

environments.production = {
	'httpPort' : 5000,
	'httpsPort': 5001,
	'envName': 'production',
	 'hashingSecret': 'thisIsAlsoASecret',
	  'stripe': {
    'secretKey': 'sk_test_J3lxj7EID03OOfYjKB7h6oyD'
  },
  'mailgun': {
    'domainName': 'sandbox12a87ee15d4c4c57a01c6320ed14d74f.mailgun.org',
    'apiKey': '6b5b57df6f416c052d7bcde9118c8333-a3d67641-29c0931f',
    'from': 'aditya20apr@sandbox12a87ee15d4c4c57a01c6320ed14d74f.mailgun.org'
  }
}


//Determine which environments was passed as command-line arguments

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check that the current environments is one of the environments above, if not, default to staging

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module

module.exports = environmentToExport;