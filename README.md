Homework Assignment #2

This is the second of several homework assignments you'll receive in this course. In order to receive your certificate of completion (at the end of this course) you must complete all the assignments and receive a passing grade. 

How to Turn It In:

1. Create a public github repo for this assignment. 

2. Create a new post in the Facebook Group  and note "Homework Assignment #2" at the top.

3. In that thread, discuss what you have built, and include the link to your Github repo. 

The Assignment (Scenario):

You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

2. Users can log in and log out by creating or destroying a token.

3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system). 

4. A logged-in user should be able to fill a shopping cart with menu items

5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 


Api Example uses:

1. Users

  >  Create method :post url: http://localhost:3000/users;
  > Body:  {

   "firstName": "Aditya kumar",
   "lastName": "sinha",
   "password": "sinha",
   "email": "aditya20apr@gmail.com",
   "streetAddress": "B-665 Gd Colonly",
   "tosAgreement": true
}

  Users (put:)

  > Create method define herre url: http://localhost:3000/users {token: u08kky44lnddynpsnova}
  > Body : {"firstName": "Aditya",
   "lastName": "sinha",
   "password": "sinhakuma",
   "email": "aditya20apr@gmail.com",
   "streetAddress": "B-665 Gd Colonly",}

 users (Delete: )
  > Create delete method url : http://localhost:3000/users {token :u08kky44lnddynpsnova}

2. Tokens  

  > Login: method: POST url: "localhost:3000/tokens" body: { "email": "aditya20apr@gmail.com", }, response: { "email": "aditya20apr@gmail.com", "id": u08kky44lnddynpsnova}"expires": 1539782272342}
  > Logout: method: DELETE url: "localhost:3000/tokens" body: { "id": u08kky44lnddynpsnova}},

3. Menu:
  > Get the menu method: GET url: "localhost:3000/menu?email=aditya20apr@gmail.com", headers: { token: u08kky44lnddynpsnova}},
  > Response : [
{
 "code": "PIZ-001",
"type": "pizza",
"price": 100,
"name": "DELUXE VEGGIE"
 },
{
"code": "PIZ-002",
"type": "pizza",
"price": 350,
"name": "VEG EXTRAVAGANZA"
    },
   
               {"code": "PIZ-003","type": "pizza","price": 450,"name": "5 PEPPER"}, {"code": "PIZ-004","type": "pizza",
"price": 120,
"name": "DOUBLE CHEESE MARGHERITA"
    },
    
	       {"code": "PIZ-005",
"type": "pizza","price": 80,"name": "CHEESE N CORN"},
 { "code": "PIZ-006",
"type": "pizza",
"price": 80,
"name": "FRESH VEGGIE"
},
    
               {"code": "PIZ-007",
"type": "pizza","price": 100,"name": "FARMHOUSE"},
    
	       {
"code": "PIZ-008",
"type": "pizza",
"price": 60,
"name": "PEPPY PANEER"
}]
4. Orders:

    Create an order method: POST url: "localhost:3000/order" headers: { token: wxklz34rmdhd551xaljw }, body: { "email": "aditya20apr@gmail.com", "order": [ "PIZ-004", "PIZ-001", "PIZ-004" ] }, response: {}

   --> Stripe payment is processed --> Mail is sent to the recipient